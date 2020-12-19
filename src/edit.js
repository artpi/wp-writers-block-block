/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/packages/packages-i18n/
 */
import { __ } from '@wordpress/i18n';
import { useSelect, AsyncModeProvider } from '@wordpress/data';

/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/packages/packages-block-editor/#useBlockProps
 */
import { useBlockProps } from '@wordpress/block-editor';

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './editor.scss';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/developers/block-api/block-edit-save/#edit
 *
 * @return {WPElement} Element to render.
 */
export default function Edit() {
	const allBlocksBefore = useSelect( ( select ) => {
		const editor = select( 'core/block-editor' );
		const index = editor.getBlockInsertionPoint().index -1;
		return editor.getBlocks().slice( 0, index );
	  }, [] );
	function getContent() {
		const content = allBlocksBefore.map( function( block ) {
			return block.attributes.content;
		} ).join( "\r\n\r\n" );

		console.log( content );
	}


	return (
		<p { ...useBlockProps() }>
			<a onClick={ () => getContent() }>
				{ __(
					'CLICK HERE TO GENERATE PROMPT',
					'writers-block-block'
				) }
			</a>
		</p>
	);
}
