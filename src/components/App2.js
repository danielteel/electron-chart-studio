import React, { useReducer, useRef, useState } from 'react';

import Canvas2 from './Canvas2';
import ImagesPane2 from './ImagesPane2';

import ImageLibrary from '../functions/ImageLibrary';
import Loading from './Loading';

function fileName(path) {
    const start=Math.max(path.lastIndexOf('\\'), path.lastIndexOf('/'))+1;
    return path.substr(start, path.lastIndexOf('.')-start);
}


const imageLibrary = new ImageLibrary();


function canAddImage(imagesMap, newImageName){
    if (imagesMap.has(newImageName)) return false;
    return true;
}

function projectReducer(state, action){
    const payload = action.payload;

    switch (action.type){
        case 'select-image':{
            if (state.images.has(payload)){
                return {...state, selectedImage: payload};
            }else{
                console.error('projectReducer: tried to select image thats no in the list');
            }
            return state;
        }

        case 'set-project':{
            if (typeof window.gc==='function') window.gc();

            return {...payload};
        }

        case 'clear-images':{
            return {...state, selectedImage: null, images: new Map()};
        }

        case 'remove-image':{
            const hasName = state.images.has(payload);
            if (hasName){
                const newImages = new Map(state.images);
                newImages.delete(payload);
                let newSelectedImage = state.selectedImage;
                if (payload===state.selectedImage){
                    newSelectedImage=null;
                }
                return {...state, selectedImage: newSelectedImage, images: newImages};
            }
            return state;
        }
                
        case 'add-image':{
            if (!canAddImage(state.images, payload.name)){
                console.error('projectReducer: tried to add image with name of an existing image');
                return state;
            }
            const newImages = new Map(state.images);
            newImages.set(payload.name, payload.image);
            return {...state, images: newImages};
        }

        default:
            throw new Error('projectReducer: unknown action type ', action.type);
    }
}

const initialProjectState = {
    images: new Map(),
    selectedImage: null
}


export default function App(){
    const [project, _projectDispatch] = useReducer(projectReducer, initialProjectState)
    const projectDispatch = (type, payload) => _projectDispatch({type, payload});
    const drawRef = useRef();
    const [progressStatus, setProgressStatus] = useState(null);//{title: 'asdasd', value, max}

    const addImages = (filePaths) => {
        if (typeof filePaths==='string') filePaths=[filePaths];
        if (!Array.isArray(filePaths)){
            throw new Error('must pass a string or an array of strings to addImage');
        }

        setProgressStatus({title: 'Loading images', value: 0, max: filePaths.length});
        for (const file of filePaths){
            const name = fileName(file);
            if (canAddImage(project.images, name)){
                imageLibrary.loadImage(file).then( imageObj =>{
                    projectDispatch('add-image', {name, image: imageObj});
                }).catch( (e) => {
                    console.error(e);
                }).finally(()=>{
                    setProgressStatus( current => {
                        if (current.value+1===filePaths.length){
                            return null;
                        }
                        return {...current, value: current.value+1};
                    });
                });
            }
        }
    }

    const removeImage = (imageName) => {
        projectDispatch('remove-image', imageName);
        imageLibrary.unloadImage(project.images.get(imageName).image);
    }

    const setSelectedImage = (imageName) => {
        projectDispatch('select-image', imageName);
    }

    const clearImages = () => {
        projectDispatch('clear-images');
        imageLibrary.unloadAllImages();
    }

    const redraw = () => {
        const ctx = drawRef.current.getContext('2d');
        const width = drawRef.current.width;
        const height = drawRef.current.height;

        ctx.fillStyle='#123123';
        ctx.strokeStyle='#FFFFFF';
        ctx.fillRect(0, 0, width,  height);
        if (project.images.get(project.selectedImage)){
            ctx.drawImage(project.images.get(project.selectedImage).img, 0, 0);
        }
    }

    const onCanvasResize = () => {
        redraw();
    }

    if (progressStatus){
        return <Loading open={true} title={progressStatus.title} value={progressStatus.value} max={progressStatus.max}/>
    }

    return (
            <div style={{display:'flex', flexDirection:'column', width:'100%', height:'100%', boxSizing:'border-box'}}>
                <div style={{display: 'flex',  boxSizing:'border-box'}}>
                    Toolbar
                </div>   
                <div style={{display: 'flex',  boxSizing:'border-box'}}>
                    Tabs
                </div>   
                <div style={{display: 'flex', flexGrow: 1, overflow: 'hidden',  boxSizing:'border-box'}}>
                    <ImagesPane2 {...{images: project.images, selectedImage: project.selectedImage, addImages, removeImage, setSelectedImage, clearImages}}/>
                    <div style={{flexGrow: 1}}>
                        <Canvas2 style={{width:'100%', height:'100%'}} drawRef={drawRef} onResize={onCanvasResize}/>
                    </div>
                </div>
            </div>
    );
}