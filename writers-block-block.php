<?php
/**
 * Plugin Name:     Writers Block Block
 * Description:     Example block written with ESNext standard and JSX support – build step required.
 * Version:         0.1.0
 * Author:          The WordPress Contributors
 * License:         GPL-2.0-or-later
 * License URI:     https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:     writers-block-block
 *
 * @package         create-block
 */

/**
 * Registers all block assets so that they can be enqueued through the block editor
 * in the corresponding context.
 *
 * @see https://developer.wordpress.org/block-editor/tutorials/block-tutorial/applying-styles-with-stylesheets/
 */
function create_block_writers_block_block_block_init() {
	$dir = __DIR__;

	$script_asset_path = "$dir/build/index.asset.php";
	if ( ! file_exists( $script_asset_path ) ) {
		throw new Error(
			'You need to run `npm start` or `npm run build` for the "create-block/writers-block-block" block first.'
		);
	}
	$index_js     = 'build/index.js';
	$script_asset = require( $script_asset_path );
	wp_register_script(
		'create-block-writers-block-block-block-editor',
		plugins_url( $index_js, __FILE__ ),
		$script_asset['dependencies'],
		$script_asset['version']
	);
	wp_set_script_translations( 'create-block-writers-block-block-block-editor', 'writers-block-block' );

	$editor_css = 'build/index.css';
	wp_register_style(
		'create-block-writers-block-block-block-editor',
		plugins_url( $editor_css, __FILE__ ),
		array(),
		filemtime( "$dir/$editor_css" )
	);

	$style_css = 'build/style-index.css';
	wp_register_style(
		'create-block-writers-block-block-block',
		plugins_url( $style_css, __FILE__ ),
		array(),
		filemtime( "$dir/$style_css" )
	);

	register_block_type( 'create-block/writers-block-block', array(
		'editor_script' => 'create-block-writers-block-block-block-editor',
		'editor_style'  => 'create-block-writers-block-block-block-editor',
		'style'         => 'create-block-writers-block-block-block',
	) );
	add_action( 'rest_api_init', function () {
		register_rest_route( 'writers-block', '/prompt', array(
		  'methods' => 'POST',
		  'callback' => 'writers_block_generate_prompt',
		  'args' => array(
			'content' => array( "required" => true ),
			),
		  'permission_callback' => function () { // Only for admins for time being
			return current_user_can( 'edit_posts' );
		   }
		) );
	  } );

}
add_action( 'init', 'create_block_writers_block_block_block_init' );

function writers_block_generate_prompt( WP_REST_Request $request ) {
	// We are saving responses as transients, so that we don't spam the API
	if ( get_transient( 'openai-response' ) ) {
		$result = json_decode( get_transient( 'openai-response' ) );
		return array( 'prompts' => $result->choices );
	}
	$parameters = $request->get_params();
	$content = strip_tags( $parameters['content'] );
	$token = get_option( 'openai-token' );
	$api_call = wp_remote_post(
		'https://api.openai.com/v1/engines/davinci/completions',
		array(
			'headers' => array(
				'Content-Type' => 'application/json',
				'Authorization' => 'Bearer ' . $token,
			),
			'body'        => json_encode( [
				'prompt' => $content,
				'max_tokens' => 32,
			] ),
			'method'      => 'POST',
			'data_format' => 'body',
		)
	);
	// Only allow a new call every 30s
	set_transient( 'openai-response', $api_call['body'], time() + 30 );
	$result = json_decode( $api_call['body'] );
	return array( 'prompts' => $result->choices );
}
