import '../editor.scss';

import { useState, RawHTML, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { useBlockProps } from '@wordpress/block-editor';
import { Placeholder, Button } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { Spinner } from '@wordpress/components';

/**
 * This function formats the prompt to OpenAI.
 * In this case, it gets all the blocks in the editor BEFORE the current blocks, extracts text and creates a continous prompt.
 * But other modes are possible - for example get first sentence from every block and only prompt this way.
 *
 * @see https://beta.openai.com/docs/introduction/prompt-design-101
 * @param {Object} editor - reference to GB block editor instance. @see https://developer.wordpress.org/block-editor/data/data-core-editor/.
 */
function formatPromptToOpenAI( editor ) {
	const index = editor.getBlockInsertionPoint().index - 1;
	const allBlocksBefore = editor.getBlocks().slice( 0, index );
	return allBlocksBefore
		.filter( function ( block ) {
			return block && block.attributes && block.attributes.content;
		} )
		.map( function ( block ) {
			return block.attributes.content.replaceAll( '<br>', '\n\n' );
		} )
		.join( '\n\n' );
}

function getSuggestionFromOpenAI(
	setAttributes,
	setPromptedForToken,
	formattedPrompt,
	setLoadingCompletion
) {
	const data = { content: formattedPrompt };
	setLoadingCompletion( true );
	setAttributes( { requestedPrompt:true } ); // This will prevent double submitting.
	apiFetch( {
		path: '/wp/v2/openai/completions',
		method: 'POST',
		data: data,
	} )
		.then( ( res ) => {
			setLoadingCompletion( false );
			const content = res.prompts[ 0 ].text;
			// This is to animate text input. I think this will give an idea of a "better" AI.
			// At this point this is an established pattern.
			const tokens = content.split( ' ' );
			for ( let i=0; i < tokens.length; i++ ) {
				const output = tokens.slice( 0, i ).join( ' ' );
				setTimeout( () => setAttributes( { content: output } ), 50 * i );
			}
		} )
		.catch( ( res ) => {
			// We have not yet submitted a token.
			if ( res.code === 'token_missing' ) {
				setPromptedForToken( true );
				setLoadingCompletion( false );
				setAttributes( { requestedPrompt: false } ); // You get another chance.
			}
		} );
}

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/developers/block-api/block-edit-save/#edit
 *
 * @return {WPElement} Element to render.
 */
export default function Edit( { attributes, setAttributes } ) {
	const [ promptedForToken, setPromptedForToken ] = useState( false );
	const [ loadingCompletion, setLoadingCompletion ] = useState( false );

	const formattedPrompt = useSelect( ( select ) => {
		return formatPromptToOpenAI( select( 'core/block-editor' ) );
	}, [] );

	//useEffect hook is called only once when block is first rendered.
	useEffect( () => {
		//Theoretically useEffect would ensure we only fire this once, but I don't want to fire it when we get data to edit either.
		if ( ! attributes.content && ! attributes.requestedPrompt ) {
			getSuggestionFromOpenAI(
				setAttributes,
				setPromptedForToken,
				formattedPrompt,
				setLoadingCompletion
			);
		}
	}, [] );

	return (
		<div { ...useBlockProps() }>
			{ promptedForToken && (
				<Placeholder
					label={ "Coauthor Paragraph" }
					instructions = { "Please visit settings and input valid OpenAI token" }
				>
					<Button isPrimary href='options-general.php?page=coauthor' target='_blank'>{ "Visit Coauthor Settings" }</Button>
				</Placeholder>
			) }
			{ attributes.content && ! loadingCompletion && (
				<div>
					<div className="content">
						<RawHTML>
							{  attributes.content
								.trim()
								.replaceAll( '\n', '<br/>' ) }
						</RawHTML>
					</div>
				</div>
			) }
			{ loadingCompletion && (
				<div style={ {padding: '10px', textAlign: 'center' } }>
					<Spinner
					  style={{
						height: 'calc(4px * 20)',
						width: 'calc(4px * 20)'
					  }}
					/>
				</div>
			) }
		</div>
	);
}
