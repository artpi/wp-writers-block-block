import '../editor.scss';

import { useState, RawHTML, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { useBlockProps } from '@wordpress/block-editor';
import { Button, TextControl } from '@wordpress/components';
import { Spinner } from '@wordpress/components';
import { createBlock } from '@wordpress/blocks';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { useSelect, useDispatch } from '@wordpress/data';




function getImagesFromOpenAI(
	prompt,
	setAttributes,
	setLoadingImages,
	setResultImages
) {
	setLoadingImages( true );
	setAttributes( { requestedPrompt: prompt } ); // This will prevent double submitting.

	apiFetch( {
		path: '/coauthor/image',
		method: 'POST',
		data: {
			prompt
		},
	} )
		.then( ( res ) => {
			setLoadingImages( false );
			console.log( 'DALLE IMAGES', res );
			setResultImages( res.data );
		} )
		.catch( ( res ) => {
			// We have not yet submitted a token.
			if ( res.code === 'openai_token_missing' ) {
				setPromptedForToken( true );
				setLoadingImages( false );
				setAttributes( { requestedPrompt: '' } ); // You get another chance.
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
export default function Edit( { attributes, setAttributes, clientId } ) {
	const [ loadingImages, setLoadingImages ] = useState( false );
	const [ resultImages, setResultImages ] = useState( [] );
	const [ prompt, setPrompt ] = useState( '' );
	const { replaceBlock } = useDispatch( blockEditorStore );

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
						setLoadingImages,
						setResultImages
					) }>
						{ 'Submit' }
					</Button>
				</div>
			) }
			{  ! loadingImages && resultImages.length > 0 && (
				<div>
					<div>{ attributes.requestedPrompt }</div>
					<div>{ "Please choose your image" }</div>
					<div style={ { flexDirection: 'row', justifyContent: 'space-between', textAlign: 'center' } }>
					{ resultImages.map( image => (
						<img
							style={ { width: '128px', padding: '8px' } }
							src={ image.url }
							key={ image.url }
							onClick={ () => {
								replaceBlock(
									clientId,
									createBlock( 'core/image', {
										url: image.url,
										caption: attributes.requestedPrompt,
										alt: attributes.requestedPrompt
									} )
								)
							} }
						/>
					) ) }
					</div>
				</div>
			) }
			{ attributes.content && ! loadingImages && (
				<div>
					<div className="content">
						{  attributes.content }
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
