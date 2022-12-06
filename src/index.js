import { registerBlockType, createBlock } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

import './style.scss';
import editParagraph from './paragraph/edit';
import saveParagraph from './paragraph/save';
import editImage from './image/edit';
import saveImage from './image/save';

registerBlockType( 'coauthor/paragraph', {
	apiVersion: 2,
	title: __( 'Coauthor Paragraph', 'coauthor' ),
	description: __(
		'Automatically generate new paragraphs using your existing content, GPT-3 and robots.',
		'coauthor'
	),
	category: 'common',
	icon: 'welcome-write-blog',
	supports: {
		html: false,
	},
	attributes: {
		content: {
			type: 'string',
			source: 'text'
		},
		requestedPrompt: {
			type: 'boolean',
			default: false,
		},
	},
	// We are allowing transform to a paragraph to use the generated content.
	// Maybe we should provide a button inside the block that triggers the transform?
	transforms: {
		to: [
			{
				type: 'block',
				blocks: [ 'core/paragraph' ],
				transform: ( { content } ) => {
					return createBlock( 'core/paragraph', {
						content,
					} );
				},
			},
		],
	},
	/**
	 * @see ./edit.js
	 */
	edit: editParagraph,

	/**
	 * @see ./save.js
	 */
	 saveParagraph,
} );


registerBlockType( 'coauthor/image', {
	apiVersion: 2,
	title: __( 'Coauthor Image', 'coauthor' ),
	description: __(
		'Automatically generate an illustration for your post',
		'coauthor'
	),
	category: 'common',
	icon: 'welcome-write-blog',
	supports: {
		html: false,
	},
	attributes: {
		content: {
			type: 'string',
			source: 'text'
		},
		requestedPrompt: {
			type: 'string',
			default: false,
		},
	},
	/**
	 * @see ./edit.js
	 */
	edit: editImage,

	/**
	 * @see ./save.js
	 */
	save: saveImage,
} );
