import { registerBlockType, createBlock } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';


import './style.scss';
import Edit from './edit';
import save from './save';

/**
 * Every block starts by registering a new block type definition.
 *
 * @see https://developer.wordpress.org/block-editor/developers/block-api/#registering-a-block
 */
registerBlockType( 'create-block/writers-block-block', {
	apiVersion: 2,
	title: __( 'Writers Block Block', 'writers-block-block' ),
	description: __(
		'Generate new paragraph using your existing content and GPT-3',
		'writers-block-block'
	),
	category: 'widgets',
	icon: 'dashicons-welcome-write-blog',
	supports: {
		html: false,
	},
	attributes: {
		content: {
			type: 'string',
			source: 'text',
			default: __( 'Please wait, consulting robots about your content....🤖', 'writers-block-block' )
		},
		requestedPrompt: {
			type: 'boolean',
			default: false,
		},
	},
	// We are allowing transform to a paragraph to use the generated content.
	// Maybe we should provide a button inside the block that triggers the transform?
	transforms: {
        to: [ {
            type: 'block',
            blocks: [ 'core/paragraph' ],
            transform: ( { content } ) => {
                return createBlock( 'core/paragraph', {
                    content,
                } );
            },
        } ],
    },
	/**
	 * @see ./edit.js
	 */
	edit: Edit,

	/**
	 * @see ./save.js
	 */
	save,
} );
