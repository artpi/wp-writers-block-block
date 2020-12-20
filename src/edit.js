import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import apiFetch from '@wordpress/api-fetch';
import { useEffect, useState } from 'react';
import { useBlockProps } from '@wordpress/block-editor';
import { Button, TextControl } from '@wordpress/components';
import './editor.scss';

/**
 * This function formats the prompt to OpenAI.
 * In this case, it gets all the blocks in the editor BEFORE the current blocks, extracts text and creates a continous prompt.
 * But other modes are possible - for example get first sentence from every block and only prompt this way.
 * @see https://beta.openai.com/docs/introduction/prompt-design-101
 * @param {object} editor - reference to GB block editor instance. @see https://developer.wordpress.org/block-editor/data/data-core-editor/.
 */
function formatPromptToOpenAI( editor ) {
	const index = editor.getBlockInsertionPoint().index -1;
	const allBlocksBefore = editor.getBlocks().slice( 0, index );
	return allBlocksBefore.map( function( block ) {
		return block.attributes.content;
	} ).join( `

` );
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
	const [ tokenField, setTokenField ] = useState( '' );

	const editor = useSelect( ( select ) => {
		return select( 'core/block-editor' );
	}, [] );

	function getSuggestionFromOpenAI( setAttributes, token ) {
		const data = { content: formatPromptToOpenAI( editor ) };
		if ( token ) {
			data.token = token;
			setPromptedForToken( false );
		}
		apiFetch( {
			path: '/writers-block/prompt',
			method: 'POST',
			data: data,
		} ).then( res => {
			console.log( 'Open AI response', res );
			setAttributes( { content: res.prompts[0].text } );
		} ).catch( res => {
			// We have not yet submitted a token.
			if ( res.code === 'openai_token_missing' ) {
				setPromptedForToken( true );
			}
		} );
	}
	function submitToken() {
		getSuggestionFromOpenAI( setAttributes, tokenField );
	}
	//useEffect hook is called only once when block is first rendered.
	useEffect( () => {
		//Theoretically useEffect would ensure we only fire this once, but I don't want to fire it when we get data to edit either.
		setAttributes( { requestedPrompt: true } );
		if ( ! attributes.requestedPrompt ) {
			getSuggestionFromOpenAI( setAttributes );
		}
	}, [] );

	return (
		<div { ...useBlockProps() }>
			{ promptedForToken && ( <div>
				<TextControl
					label="Please provide the OpenAI token to continue:"
					value={ tokenField }
					onChange={ ( val ) => setTokenField( val ) }
				/>
				<Button isPrimary onClick={ () => submitToken() }>{ __( 'Submit' ) }</Button>
			</div> ) }
			{ ! promptedForToken && ( <div>
				<div className="disclaimer">GPT-3 says:</div>
				<div className="content">{ attributes.content }</div>
			</div> ) }
		</div>
	);
}
