import React from 'react';
import { observer } from 'mobx-react-lite';
import { InputGroup, Button, ButtonGroup, Tab, Tabs, 
    Dialog,
    DialogBody,
    DialogFooter,
    FileInput, } from '@blueprintjs/core';
import { SectionTab } from 'polotno/side-panel';
import { getImageSize } from 'polotno/utils/image';
import FaBrain from '@meronex/icons/fa/FaBrain';
import { ImagesGrid } from 'polotno/side-panel/images-grid';
import axios from 'axios';
import localforage from 'localforage';


const GenerateTab = observer( ( { store } ) =>
{
    const inputRef = React.useRef( null );
    const [ image, setImage ] = React.useState( null );
    const [ loading, setLoading ] = React.useState( false );
    const [isOpen, setIsOpen] = React.useState(false);
    const [modal, setModal] = React.useState( null );
    const [loadingModal, setLoadingModal] = React.useState( false );
    
    const fileRef = React.useRef( null );

    const editRef = React.useRef( null );
    const [editImage, setEditImage] = React.useState( null )
    const [variationImage, setVariationImage] = React.useState( null )
    const [history, setHistory] = React.useState( null )
    const [showHistory, setShowHistory] = React.useState( false )

    const url = process.env.NEXT_PUBLIC_UPLOAD_IMAGE_DOMAIN

    React.useEffect(() => {
        const fetchData = async () => {
            const storage = await localforage.getItem("image")
            if (!Array.isArray(storage)) {
                localforage.setItem("image", [])
                setHistory([])
            }
            else {
                setHistory(storage)
            }
        }
        fetchData()
    }, []);

    const handleGenerate = async () =>
    {
        let image_url;

        setLoading( true );
        setImage( null );

        try
        {
            const response = await axios.post('/api/generate', { input: inputRef.current.value })

            console.log(response.data)
            image_url = response.data

            setLoading( false );
            setImage( image_url );

        } catch ( error )
        {
            if ( error.response )
            {
                console.log( error.response.status );
                console.log( error.response.data );
            } else
            {
                console.log( error.message );
            }
        }

        let imageStorage = await localforage.getItem("image")
        localforage.setItem("image", [...imageStorage, ...image_url])
        setHistory([...imageStorage, ...image_url])
    };

    const handleFileUpload = async (e) => {
        setLoadingModal(true)
        const formData = new FormData();
        formData.append('file', e.target.files[0]);
        const upload = await axios.post(`${url}/files`, formData)
        setLoadingModal(false)

        const src = `${url}/assets/${upload.data.data.id}`
        modal === 'edit' 
        ? setEditImage(src)
        : setVariationImage(src)
    }

    const handleVariation = async () =>
    {
        let image_url;

        setLoading( true );
        setImage( null );

        try
        {
            const response = await axios.post('/api/variation', { url: variationImage })

            console.log(response.data)
            image_url = response.data

            setLoading( false );
            setImage( image_url );

        } catch ( error )
        {
            if ( error.response )
            {
                console.log( error.response.status );
                console.log( error.response.data );
            } else
            {
                console.log( error.message );
            }
        }

        let imageStorage = await localforage.getItem("image")
        localforage.setItem("image", [...imageStorage, ...image_url])
        setHistory([...imageStorage, ...image_url])
    };

    const handleEdit = async () =>
    {
        let image_url;

        setLoading( true );
        setImage( null );

        try
        {
            const response = await axios.post('/api/edit', { 
                url: editImage, 
                prompt: editRef.current.value 
            })

            console.log(response.data)
            image_url = response.data

            setLoading( false );
            setImage( image_url );

        } catch ( error )
        {
            if ( error.response )
            {
                console.log( error.response.status );
                console.log( error.response.data );
            } else
            {
                console.log( error.message );
            }
        }

        let imageStorage = await localforage.getItem("image")
        localforage.setItem("image", [...imageStorage, ...image_url])
        setHistory([...imageStorage, ...image_url])
    };

    return (
        <div style={ { height: '100%', display: 'flex', flexDirection: 'column' } }>
            <div style={ { height: '40px', paddingTop: '5px' } }>
                Generate image with Dalle2
            </div>
            <div style={ { padding: '15px 0' } }>
                DALL·E 2 is an AI system that can create realistic images and art from a description in natural language.
            </div>
            <InputGroup
                placeholder="Type your image generation prompt here..."
                onKeyDown={ ( e ) =>
                {
                    if ( e.key === 'Enter' )
                    {
                        handleGenerate();
                    }
                } }
                style={ {
                    marginBottom: '20px',
                } }
                inputRef={ inputRef }
            />
            <Button
                onClick={ handleGenerate }
                intent="primary"
                loading={ loading }
                style={ { marginBottom: '40px' } }
            >
                Generate
            </Button>
            { loading && (
                <img src="/loading3.gif" alt="loading"/>  
            )}
            { (image && !loading) && (
                <ImagesGrid
                    shadowEnabled={ false }
                    images={ image ? image.map((image) => image.url) : [] }
                    getPreview={ ( item ) => item }
                    isLoading={ loading }
                    onSelect={ async ( item, pos, element ) =>
                    {                        
                        const src = item;
                        if ( element && element.type === 'svg' && element.contentEditable )
                        {
                            element.set( { maskSrc: src } );
                            return;
                        }

                        if (
                            element &&
                            element.type === 'image' &&
                            element.contentEditable
                        )
                        {
                            element.set( { src: src } );
                            return;
                        }

                        const { width, height } = await getImageSize( src );
                        const x = ( pos?.x || store.width / 2 ) - width / 2;
                        const y = ( pos?.y || store.height / 2 ) - height / 2;
                        store.activePage?.addElement( {
                            type: 'image',
                            src: src,
                            width,
                            height,
                            x,
                            y,
                        } );
                    } }
                    rowsNumber={ 2 }
                />
            ) }

            <Button onClick={() => { 
                    setIsOpen(!isOpen)
                    setModal('edit') 
                }} 
                text={'Edit image with prompt'} 
                outlined={true}
                icon="edit"
            />
            <Button onClick={() => { 
                    setIsOpen(!isOpen) 
                    setModal('variation')
                }} 
                text={'Create variation of image'} 
                style={{ marginTop: "15px" }}
                icon="diagram-tree"
            />
            { modal === 'edit' ? (
                <Dialog title="Edit image with prompt" icon="media" isOpen={isOpen} onClose={() => { setIsOpen(!isOpen) }}>
                    <DialogBody>
                        <ButtonGroup>
                            <Button icon="export" onClick={() => { fileRef.current.click() }}>Upload your own image</Button>
                            <Button icon="history" onClick={() => { setShowHistory(!showHistory) }}>Choose image from history</Button>
                        </ButtonGroup>
                        <div style={{ color: "red", marginBlock: "5px" }}>Must be 256 x 256 and transparent.</div>
                        <InputGroup
                            placeholder="Type a text description of the desired image..."
                            style={ {
                                marginBlock: '10px',
                            } }
                            onKeyDown={ ( e ) =>
                                {
                                    if ( e.key === 'Enter' )
                                    {
                                        setIsOpen(!isOpen) 
                                        handleEdit()
                                    }
                                } }
                            inputRef={ editRef }
                        />
                        <input type='file' ref={fileRef} onChange={handleFileUpload} style={{ display: "none" }}/>
                        { loadingModal && (
                            <img src="/loading3.gif" alt="loading" style={{ marginInline: 'auto' }}/>  
                        )}
                        { editImage && (
                           <img src={editImage} alt="uploaded image" style={{ marginBlock: "15px", marginInline: 'auto' }}></img> 
                        )}    
                        { showHistory && (
                            <ImagesGrid
                                shadowEnabled={false}
                                images={ history ? history?.map((history) => history.url) : [] }
                                getPreview={ ( item ) => item }
                                onSelect={(item) => {
                                    setEditImage(item)
                                    setShowHistory(false)
                                }}
                                rowsNumber={4}
                            />
                        )}
                    </DialogBody>
                    <DialogFooter minimal={true} 
                        actions={<Button intent="primary" text="Submit" 
                        onClick={() => { 
                            setIsOpen(!isOpen) 
                            handleEdit()
                        }} />} 
                    />
                </Dialog> 
            ) : (
                <Dialog title="Create variation of image" icon="media" isOpen={isOpen} onClose={() => { setIsOpen(!isOpen) }}>
                    <DialogBody>
                        <ButtonGroup>
                            <Button icon="export" onClick={() => { fileRef.current.click() }}>Upload your own image</Button>
                            <Button icon="history" onClick={() => { setShowHistory(!showHistory) }}>Choose image from history</Button>
                        </ButtonGroup>
                        <div style={{ color: "red", marginBlock: "5px" }}>Must be 256 x 256.</div>
                        <input type='file' ref={fileRef} onChange={handleFileUpload} style={{ display: "none" }}/>
                        { loadingModal && (
                            <img src="/loading3.gif" alt="loading" style={{ marginInline: 'auto' }}/>  
                        )}
                        { variationImage && (
                           <img src={variationImage} alt="uploaded image" style={{ marginBlock: "15px", marginInline: 'auto' }}></img> 
                        )}    
                        { showHistory && (
                            <ImagesGrid
                                shadowEnabled={false}
                                images={ history ? history?.map((history) => history.url) : [] }
                                getPreview={ ( item ) => item }
                                onSelect={(item) => {
                                    setVariationImage(item)
                                    setShowHistory(false)
                                }}
                                rowsNumber={4}
                            />
                        )}
                    </DialogBody>
                    <DialogFooter minimal={true} 
                        actions={<Button intent="primary" text="Submit" 
                        onClick={() => { 
                            setIsOpen(!isOpen) 
                            handleVariation()
                        }} />} 
                    />
                </Dialog> 
            )}

       </div>
    );
} );

const HistoryTab = observer(({ store }) => {
    const [ image, setImage ] = React.useState( [] );
    const [ loading, setLoading ] = React.useState( false );
  
    React.useEffect(() => {
        const fetchData = async () => {
            const storage = await localforage.getItem("image")
            setImage(storage)
        }
        fetchData()
    }, []);
  
    return (
      <>
        <p>
          Your previously generated images.
        </p>
        { loading && (
            <img src="/loading3.gif" alt="loading"/>  
        )}
        { (image && !loading) && (
            <ImagesGrid
            shadowEnabled={false}
            images={ image ? image?.map((image) => image.url) : [] }
            getPreview={ ( item ) => item }
            onSelect={async (item, pos, element) => {
                const src = item;
                if ( element && element.type === 'svg' && element.contentEditable )
                {
                    element.set( { maskSrc: src } );
                    return;
                }

                if (
                    element &&
                    element.type === 'image' &&
                    element.contentEditable
                )
                {
                    element.set( { src: src } );
                    return;
                }

                const { width, height } = await getImageSize( src );
                const x = ( pos?.x || store.width / 2 ) - width / 2;
                const y = ( pos?.y || store.height / 2 ) - height / 2;
                store.activePage?.addElement( {
                    type: 'image',
                    src: src,
                    width,
                    height,
                    x,
                    y,
                } );
            }}
            rowsNumber={2}
            />
        ) }
      </>
    );
});

const StableDiffusionPanel = observer(({ store }) => {
    const [selectedTabId, setSelectedTabId] = React.useState('generate');
    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Tabs
          id="TabsExample"
          defaultSelectedTabId="generate"
          onChange={(tabId) => {
            setSelectedTabId(tabId);
          }}
        >
          <Tab id="generate" title="Generate" />
          <Tab id="history" title="History" />
        </Tabs>
        <div
          style={{
            height: 'calc(100% - 20px)',
            display: 'flex',
            flexDirection: 'column',
            paddingTop: '20px',
          }}
        >
          {selectedTabId === 'generate' && <GenerateTab store={store} />}
          {selectedTabId === 'history' && <HistoryTab store={store} />}
        </div>
      </div>
    );
});
  
// define the new custom section
export const StableDiffusionSection = {
    name: 'stable-diffusion',
    Tab: (props) => (
      <SectionTab name="AI Generated" {...props}>
        <FaBrain style={{ marginInline: 'auto' }} />
      </SectionTab>
    ),
    // we need observer to update component automatically on any store changes
    Panel: StableDiffusionPanel,
};