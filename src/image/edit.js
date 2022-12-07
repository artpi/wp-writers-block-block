import '../editor.scss';

import { useState, RawHTML, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { useBlockProps } from '@wordpress/block-editor';
import { Button, TextControl, Placeholder } from '@wordpress/components';
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
			const images = res.data.map( image => {
				return 'data:image/png;base64,' + image.b64_json;
			} );
			setResultImages( images );
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

	const { mediaUpload } = useSelect(
		( select ) => {
			const { getSettings } =
				select( blockEditorStore );
			const settings = getSettings();
			return {
				mediaUpload: settings.mediaUpload,
			};
		},
		[]
	);

	return (
		<div { ...useBlockProps() }>
			<Placeholder
				label={ "Coauthor Image" }
			>
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
					<div style={ {textAlign: 'center', margin: '12px', fontStyle: 'italic'} }>{ attributes.requestedPrompt }</div>
					<div style={ { fontSize: '20px', lineHeight: '38px'} }>{ "Please choose your image" }</div>
					<div style={ { flexDirection: 'row', justifyContent: 'space-between', textAlign: 'center' } }>
					{ resultImages.map( image => (
						// <div>
						// 	{image.url}
						// 	</div>
						<img
							style={ { width: '128px', padding: '8px' } }
							src={ image }
							key={ image }
							onClick={ async () => {
								// First convert image to a proper blob file
								const resp = await fetch( image );
								const blob = await resp.blob();
								const file = new File( [ blob ], 'coauthor_image.png', { type: 'image/png'} )
								// Actually upload the image
								mediaUpload( {
									filesList: [ file ],
									onFileChange: ( [ img ] ) => {
										replaceBlock(
											clientId,
											createBlock( 'core/image', {
												url: img.url,
												caption: attributes.requestedPrompt,
												alt: attributes.requestedPrompt
											} )
										)
									},
									allowedTypes: [ 'image' ],
									onError: ( message ) => {
										// TODO: Needs some refinement.
										console.error( message );
									},
								} );

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
		</Placeholder>
		</div>
	);
}
