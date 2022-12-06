import '../editor.scss';

import { useState, RawHTML, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { useBlockProps } from '@wordpress/block-editor';
import { Button, TextControl } from '@wordpress/components';
import { Spinner } from '@wordpress/components';


function getImagesFromOpenAI(
	prompt,
	setAttributes,
	setLoadingImages
) {
	setLoadingImages( true );
	setAttributes( { requestedPrompt: prompt } ); // This will prevent double submitting.
	setTimeout( () => {
		setLoadingImages( false );
		setAttributes( { content: 'potato' } );
	}, 3000 );

	// apiFetch( {
	// 	path: '/coauthor/prompt',
	// 	method: 'POST',
	// 	data: data,
	// } )
	// 	.then( ( res ) => {
	// 		setLoadingImages( false );
	// 		const content = res.prompts[ 0 ].text;
	// 		// This is to animate text input. I think this will give an idea of a "better" AI.
	// 		// At this point this is an established pattern.
	// 		const tokens = content.split( ' ' );
	// 		for ( let i=0; i < tokens.length; i++ ) {
	// 			const output = tokens.slice( 0, i ).join( ' ' );
	// 			setTimeout( () => setAttributes( { content: output } ), 50 * i );
	// 		}
	// 	} )
	// 	.catch( ( res ) => {
	// 		// We have not yet submitted a token.
	// 		if ( res.code === 'openai_token_missing' ) {
	// 			setPromptedForToken( true );
	// 			setLoadingImages( false );
	// 			setAttributes( { requestedPrompt:false } ); // You get another chance.
	// 		}
	// 	} );
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
	const [ loadingImages, setLoadingImages ] = useState( false );
	const [ prompt, setPrompt ] = useState( '' );

	return (
		<div { ...useBlockProps() }>
			{ ! attributes.requestedPrompt && (
				<div>
					<TextControl
						label="What would you like to see?"
						onChange={ setPrompt }
					/>
					<Button isPrimary onClick={ () => getImagesFromOpenAI(
						prompt,
						setAttributes,
						setLoadingImages
					) }>
						{ 'Submit' }
					</Button>
				</div>
			) }
			{ attributes.content && ! loadingImages && (
				<div>
					<div className="content">
						<RawHTML>
							{  attributes.content }
						</RawHTML>
					</div>
				</div>
			) }
			{ loadingImages && (
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
