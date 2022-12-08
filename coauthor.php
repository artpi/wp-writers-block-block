<?php
/**
 * Plugin Name:     Coauthor - AI Writing Assistant
 * Description:     Coauthor is here to help so you can focus on making your posts shine. You can automatically generate new paragraphs and Images using OpenAI.
 * Version:         0.3.2
 * Author:          Artur Piszek (artpi)
 * Author URI:      https://piszek.com
 * License:         GPL-2.0-or-later
 * License URI:     https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:     coauthor
 *
 * @package         coauthor
 */

function create_block_coauthor_init() {
	$dir = __DIR__;
	require_once __DIR__ . '/class.openai_rest_controller.php';
	new OpenAI_REST_Controller();

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
}

add_action( 'init', 'create_block_coauthor_init' );

