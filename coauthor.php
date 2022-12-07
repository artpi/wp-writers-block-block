<?php
/**
 * Plugin Name:     Coauthor - AI Writing Assistant
 * Description:     Coauthor is here to help so you can focus on making your posts shine. You can automatically generate new paragraphs and Images using OpenAI.
 * Version:         0.3.1
 * Author:          Artur Piszek (artpi)
 * Author URI:      https://piszek.com
 * License:         GPL-2.0-or-later
 * License URI:     https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:     coauthor
 *
 * @package         coauthor
 */

/**
 * This is an API endpoint to pass requests on to OpenAI
 */
function coauthor_call_openai( WP_REST_Request $request ) {
	//We are saving responses as transients, so that we don't spam the API.
	$parameters = $request->get_params();
	$content    = strip_tags( $parameters['content'] );
	// Useful for testing:
	// sleep(2);
	// return array( 'prompts' => [ [ 'text' => 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?' ] ] );

	if ( ! empty( $parameters['token'] ) ) {
		$token = $parameters['token'];
		update_option( 'openai-token', $token );
	} else {
		$token = get_option( 'openai-token' );
	}

	// We gotta stop if the token is not there.
	if ( empty( $token ) || strlen( $token ) < 5 ) {
		//TODO: I'm sure there is a way to pass 401 and not 500 here, but this way is not working.
		return new WP_Error( 'openai_token_missing', __( 'Please provide a token' ), [ 'status' => 401 ] );
	}

	if ( get_transient( 'openai-response' ) ) {
		$result = json_decode( get_transient( 'openai-response' ) );
		return array( 'prompts' => $result->choices );
	}

	$api_call = wp_remote_post(
		'https://api.openai.com/v1/completions',
		array(
			'headers'     => array(
				'Content-Type'  => 'application/json',
				'Authorization' => 'Bearer ' . $token,
			),
			'body'        => json_encode(
				[
					'model'      => 'text-davinci-003',
					'prompt'     => $content,
					'max_tokens' => 110, // This is length of generated prompt. A token is about 4 chars. I took 110 from Lex.page.
				]
			),
			'method'      => 'POST',
			'data_format' => 'body',
			'timeout'     => 60,
		)
	);
	if ( is_wp_error( $api_call ) ) {
		return $api_call;
	}
	// Only allow a new call every 60s - TODO: Maybe there should be some message in the editor that it's recycled message?
	set_transient( 'openai-response', $api_call['body'], 60 );
	$result = json_decode( $api_call['body'] );
	return array( 'prompts' => $result->choices );
}



/**
 * This is an API endpoint to pass requests on to OpenAI
 */
function coauthor_call_dalle( WP_REST_Request $request ) {
	//We are saving responses as transients, so that we don't spam the API.
	$parameters = $request->get_params();

	if ( ! empty( $parameters['token'] ) ) {
		$token = $parameters['token'];
		update_option( 'openai-token', $token );
	} else {
		$token = get_option( 'openai-token' );
	}

	// We gotta stop if the token is not there.
	if ( empty( $token ) || strlen( $token ) < 5 ) {
		//TODO: I'm sure there is a way to pass 401 and not 500 here, but this way is not working.
		return new WP_Error( 'openai_token_missing', __( 'Please provide a token' ), [ 'status' => 401 ] );
	}

	if ( get_transient( 'openai-dalle-response-' . md5( $parameters['prompt'] ) ) ) {
		return json_decode( get_transient( 'openai-dalle-response-' . md5( $parameters['prompt'] ) ) );
	}

	$api_call = wp_remote_post(
		'https://api.openai.com/v1/images/generations',
		array(
			'headers'     => array(
				'Content-Type'  => 'application/json',
				'Authorization' => 'Bearer ' . $token,
			),
			'body'        => json_encode(
				[
					'prompt' => $parameters['prompt'],
					'n'      => 4, // Generate 4 options each time,
					'size'   => '512x512',
					'response_format' => 'b64_json'
				]
			),
			'method'      => 'POST',
			'data_format' => 'body',
			'timeout'     => 60,
		)
	);
	if ( is_wp_error( $api_call ) ) {
		return $api_call;
	}
	// We cache responses for the same prompts for a month.
	set_transient( 'openai-dalle-response-' . md5( $parameters['prompt'] ), $api_call['body'], 3600 * 24 ); // Same prompts only allowed once a day.
	$result = json_decode( $api_call['body'] );
	return $result;
}


/**
 * Registers all block assets so that they can be enqueued through the block editor
 * in the corresponding context.
 *
 * @see https://developer.wordpress.org/block-editor/tutorials/block-tutorial/applying-styles-with-stylesheets/
 */
function create_block_coauthor_init() {
	$dir = __DIR__;

	$script_asset_path = "$dir/build/index.asset.php";
	if ( ! file_exists( $script_asset_path ) ) {
		throw new Error(
			'You need to run `npm start` or `npm run build` for the "create-block/coauthor" block first.'
		);
	}
	$index_js     = 'build/index.js';
	$script_asset = require $script_asset_path;
	wp_register_script(
		'create-block-coauthor-block-editor',
		plugins_url( $index_js, __FILE__ ),
		array_merge( $script_asset['dependencies'], [ 'wp-data', 'wp-element', 'wp-components', 'wp-api-fetch', 'wp-block-editor' ] ), // This is hardcoded here because Jetpack does not play nice with ES6 dependencies for these.
		$script_asset['version']
	);
	wp_set_script_translations( 'create-block-coauthor-block-editor', 'coauthor' );

	$editor_css = 'build/index.css';
	wp_register_style(
		'create-block-coauthor-block-editor',
		plugins_url( $editor_css, __FILE__ ),
		array(),
		filemtime( "$dir/$editor_css" )
	);

	$style_css = 'build/style-index.css';
	wp_register_style(
		'create-block-coauthor-block',
		plugins_url( $style_css, __FILE__ ),
		array(),
		filemtime( "$dir/$style_css" )
	);

	register_block_type(
		'create-block/coauthor',
		array(
			'editor_script' => 'create-block-coauthor-block-editor',
			'editor_style'  => 'create-block-coauthor-block-editor',
			'style'         => 'create-block-coauthor-block',
		)
	);
	add_action(
		'rest_api_init',
		function () {
			register_rest_route(
				'coauthor',
				'/prompt',
				array(
					'methods'             => 'POST',
					'callback'            => 'coauthor_call_openai',
					'args'                => array(
						'content' => array( 'required' => true ),
						'token'   => array( 'required' => false ),
					),
					'permission_callback' => function () {
						// Only for admins for time being
						return current_user_can( 'edit_posts' );
					},
				)
			);
			register_rest_route(
				'coauthor',
				'/image',
				array(
					'methods'             => 'POST',
					'callback'            => 'coauthor_call_dalle',
					'args'                => array(
						'prompt' => array( 'required' => true ),
						'token'  => array( 'required' => false ),
					),
					'permission_callback' => function () {
						// Only for admins for time being
						return current_user_can( 'edit_posts' );
					},
				)
			);
		}
	);
}

add_action( 'init', 'create_block_coauthor_init' );

