import '../editor.scss';

import { useState, RawHTML, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { useBlockProps } from '@wordpress/block-editor';
import { Button, Placeholder, TextareaControl, Flex, FlexBlock, FlexItem } from '@wordpress/components';
import { Spinner } from '@wordpress/components';
import { createBlock } from '@wordpress/blocks';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { useSelect, useDispatch } from '@wordpress/data';

function getImagesFromOpenAI(
	prompt,
	setAttributes,
	setLoadingImages,
	setResultImages,
	setPromptedForToken
) {
	setLoadingImages( true );
	setAttributes( { requestedPrompt: prompt } ); // This will prevent double submitting.

	apiFetch( {
		path: '/wp/v2/openai/images/generations',
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
			if ( res.code === 'token_missing' ) {
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
	const [ promptedForToken, setPromptedForToken ] = useState( false );


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
			{ promptedForToken && (
				<Placeholder
					label={ "Coauthor Image" }
					instructions = { "Please visit settings and input valid OpenAI token" }
				>
					<Button isPrimary href='options-general.php?page=coauthor' target='_blank'>{ "Visit Coauthor Settings" }</Button>
				</Placeholder>
			) }
			{ ! promptedForToken && ! attributes.requestedPrompt && (
				<Placeholder
					label={ "Coauthor Image" }
				>
				<div>
					<TextareaControl
						label="What would you like to see?"
						onChange={ setPrompt }
					/>
					<Button isPrimary onClick={ () => getImagesFromOpenAI(
						prompt,
						setAttributes,
						setLoadingImages,
						setResultImages,
						setPromptedForToken
					) }>
						{ 'Submit' }
					</Button>
				</div>
				</Placeholder>
			) }
			{  ! loadingImages && resultImages.length > 0 && (
				<Placeholder
					label={ "Coauthor Image" }
				>
				<div>
					<div style={ {textAlign: 'center', margin: '12px', fontStyle: 'italic'} }>{ attributes.requestedPrompt }</div>
					<div style={ { fontSize: '20px', lineHeight: '38px'} }>{ "Please choose your image" }</div>
					<Flex direction='row' justify={ 'space-between' } >
					{ resultImages.map( image => (
						<FlexBlock key={ image }>
							<img
								className='wp-block-coauthor-image-image'
								src={ image }
								onClick={ async () => {
									if ( loadingImages ) {
										return;
									}
									setLoadingImages( true );
									// First convert image to a proper blob file
									const resp = await fetch( image );
									const blob = await resp.blob();
									const file = new File( [ blob ], 'coauthor_image.png', { type: 'image/png'} )
									// Actually upload the image
									mediaUpload( {
										filesList: [ file ],
										onFileChange: ( [ img ] ) => {
											if ( ! img.id ) {
												// Without this image gets uploaded twice
												return;
											}
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
											setLoadingImages( false );
										},
									} );

								} }
							/>
						</FlexBlock>
					) ) }
					</Flex>
				</div>
				</Placeholder>
			) }
			{ attributes.content && ! loadingImages && (
				<Placeholder
					label={ "Coauthor Image" }
				>
				<div>
					<div className="content">
						{  attributes.content }
					</div>
				</div>
				</Placeholder>
			) }
			{ loadingImages && (
				<Placeholder
					label={ "Coauthor Image" }
				>
				<div style={ {padding: '10px', textAlign: 'center' } }>
					<Spinner
					  style={{
						height: 'calc(4px * 20)',
						width: 'calc(4px * 20)'
					  }}
					/>
				</div>
				</Placeholder>
			) }
		</div>
	);
}
