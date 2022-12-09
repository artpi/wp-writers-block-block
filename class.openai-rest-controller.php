<?php

class OpenAI_REST_Controller extends WP_REST_Controller {

	public $text_completion_cooldown_seconds = 10; // Allow new completion every X seconds. Will return cached result otherwise.
	public $image_generation_cache_timeout   = 3600 * 24 * 31; // Cache images for a prompt for a month.

	public function __construct() {
		$this->namespace = 'wp/v2';
		$this->rest_base = 'openai';
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	/**
	 * Called automatically on `rest_api_init()`.
	 */
	public function register_routes() {
		register_rest_route(
			$this->namespace,
			$this->rest_base . '/completions',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'request_gpt_completion' ),
					'permission_callback' => array( $this, 'get_status_permission_check' ),
				),
				'args' => array(
					'content' => array( 'required' => true ),
					'token'   => array( 'required' => false ),
				),
			)
		);
		register_rest_route(
			$this->namespace,
			$this->rest_base . '/images/generations',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'request_dalle_generation' ),
					'permission_callback' => array( $this, 'get_status_permission_check' ),
				),
				'args' => array(
					'prompt' => array( 'required' => true ),
					'token'  => array( 'required' => false ),
				),
			)
		);
	}

	public function log_request_dalle_generation( $prompt, array $response ) {
		// Nothing here.
		error_log( 'Generating dalle images for prompt: ' . $prompt );
	}

	public function log_request_gpt_completion( $prompt, $response ) {
		// Nothing for now.
		error_log( 'OpenAI Completion: ' . json_encode( $response ) );
	}

	public function get_openai_token() {
		$option = get_option( 'coauthor' );
		if ( ! empty( $option['openai-token'] ) ) {
			return $option['openai-token'];
		}
		return false;
	}

	/**
	 * Ensure the user has proper permissions
	 *
	 * @return boolean
	 */
	public function get_status_permission_check() {
		return current_user_can( 'edit_posts' );
	}

	protected function transient_name_for_prompt( $prompt ) {
		return 'openai-image-' . md5( $prompt );
	}

	public function request_dalle_generation( WP_REST_Request $request ) {
		//We are saving responses as transients, so that we don't spam the API.
		$parameters = $request->get_params();

		$token = $this->get_openai_token();

		if ( ! $token ) {
			return new \WP_Error( 'token_missing', __( 'OpenAI Token is missing from configuration' ) );
		}

		$cache = get_transient( $this->transient_name_for_prompt( $parameters['prompt'] ) );
		if ( $cache ) {
			return json_decode( $cache );
		}

		$api_call = wp_remote_post(
			'https://api.openai.com/v1/images/generations',
			array(
				'headers'     => array(
					'Content-Type'  => 'application/json',
					'Authorization' => 'Bearer ' . $token,
				),
				'body'        => json_encode(
					array(
						'prompt'          => $parameters['prompt'],
						'n'               => 4, // Generate 4 options each time,
						'size'            => '512x512',
						'response_format' => 'b64_json', // This will return image body inside JSON, so that we don't have to deal with CORS on images.
						'user'            => strval( get_current_user_id() ), // This logs the user id on the OpenAI side so it's easier to detect abuse.
					)
				),
				'method'      => 'POST',
				'data_format' => 'body',
				'timeout'     => 60, // This may not be enough, but works so far.
			)
		);
		$this->log_request_dalle_generation( $parameters['prompt'], $api_call );
		if ( is_wp_error( $api_call ) ) {
			return $api_call;
		}
		// We cache responses for the same prompts for a month.
		set_transient( $this->transient_name_for_prompt( $parameters['prompt'] ), $api_call['body'], $this->image_generation_cache_timeout );
		$result = json_decode( $api_call['body'] );
		return $result;
	}

	protected function transient_name_for_completion() {
		return 'openai-completion-' . get_current_user_id(); // Cache for each user, so that other users dont get weird cached version from somebody else.
	}

	public function request_gpt_completion( WP_REST_Request $request ) {
		$parameters = $request->get_params();
		$content    = strip_tags( $parameters['content'] );
		$token      = $this->get_openai_token();

		if ( ! $token ) {
			return new \WP_Error( 'token_missing', __( 'OpenAI Token is missing from configuration' ) );
		}

		$cache = get_transient( $this->transient_name_for_completion() );
		if ( $cache ) {
			return array( 'prompts' => array( $cache ) );
		}

		$api_call = wp_remote_post(
			'https://api.openai.com/v1/completions',
			array(
				'headers'     => array(
					'Content-Type'  => 'application/json',
					'Authorization' => 'Bearer ' . $token,
				),
				'body'        => json_encode(
					array(
						'model'      => 'text-davinci-003', // Most capable model of GPT3
						'prompt'     => $content,
						'max_tokens' => 110, // This is length of generated prompt. A token is about 4 chars. I took 110 from Lex.page.
						'user'       => strval( get_current_user_id() ), // This logs the user id on the OpenAI side so it's easier to detect abuse.
					)
				),
				'method'      => 'POST',
				'timeout'     => 60,
				'data_format' => 'body',
			)
		);

		$this->log_request_gpt_completion( $content, $api_call );
		if ( is_wp_error( $api_call ) ) {
			return $api_call;
		}
		$result = json_decode( $api_call['body'] );
		// Only allow a new call every X seconds - TODO: Maybe there should be some message in the editor that it's recycled message?
		set_transient( $this->transient_name_for_completion(), $result->choices[0], $this->text_completion_cooldown_seconds );
		return array( 'prompts' => $result->choices );
	}
}
