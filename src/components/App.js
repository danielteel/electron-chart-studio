import React, { useState, useReducer } from 'react';

import Canvas from './Canvas';
import AddImagesButton from './AddImagesButton';
import ImagesPane from './ImagesPane';


function fileName(path) {
    const start=Math.max(path.lastIndexOf('\\'), path.lastIndexOf('/'))+1;
    return path.substr(start, path.lastIndexOf('.')-start);
}




function projectReducer(state, action){
    const payload = action.payload;

    switch (action.type){
        case 'clear-images':{
            for (const image of state.images){
                image[1].cleanup();
                state.images.delete(image[0]);
            }
            window.gc();
            return {...state, images: new Map()};
        }
                
        case 'add-image':{
            const nameAlreadyExists = state.images.has(payload.name);

            if (nameAlreadyExists){
                if (payload.hash === state.images.get(payload.name).hash){
                    payload.image.src=null;
                    return state;
                }
            }

            const newImages = new Map(state.images);
            let name = payload.name;

            if (nameAlreadyExists){
                let num=2;
                while (newImages.has(name + String(num))) num++;
                name = name + String(num);
            }

            newImages.set(payload.name, {name: payload.name, image: payload.image, hash: payload.hash, cleanup: payload.cleanup});
            return {...state, images: newImages};
        }
        default:
            throw new Error("unknown projectReducer action type:", action.type);
    }
}

const initialProjectState = {
    images: new Map(),
    pages: []
}

export default function App(){
    const [project, _projectDispatch] = useReducer(projectReducer, initialProjectState)
    const projectDispatch = (type, payload) => _projectDispatch({type, payload});


    const tryToAddImage = async (file) => {
        let imageUrl = null;
        const cleanup = () => {
            if (imageUrl){
                console.log('revoked ', imageUrl);
                URL.revokeObjectURL(imageUrl);
                imageUrl=null;
            }
        };
        try {
            const name = fileName(file);

            let imageBuffer = await window.api.fs.readFile(file);
            const hash = window.api.crypto.hashFromBuffer(imageBuffer);
            
            const nameAlreadyExists = project.images.has(name);
            if (nameAlreadyExists){
                if (hash === project.images.get(name).hash){
                    return false;
                }
            }
            let blob = new Blob([imageBuffer]);
            imageBuffer=null;
            imageUrl = URL.createObjectURL(blob);
            blob=null;
            const img = new Image();

            const onImageLoadPromise = new Promise((resolve, reject) => {
                img.onload = () => {
                    img.onload=undefined;
                    img.onerror=undefined;
                    projectDispatch('add-image', {name, image: img, hash, cleanup}); 
                    resolve(true);
                }
                img.onerror = () => {
                    img.onload=undefined;
                    img.onerror=undefined;
                    cleanup();
                    resolve(false);
                }

                img.src = imageUrl;
            });
            return await onImageLoadPromise;
        } catch (e) {
            cleanup();
            return false;
        }
    };

    return (
        <>
            <AddImagesButton tryToAddImage={tryToAddImage}/>
            <button type='button' onClick={()=>{
                projectDispatch('clear-images');
            }}>Remove all images</button>
            <ImagesPane images={project.images}/>

            {/* <Canvas backgroundColor='white' draw={ (ctx, drawFns) => {
                let drawX = 0;
                for (const [key, image] of project.images){
                    drawFns.drawImage(image.image, drawX, 0);
                    drawX+=image.image.width;
                }
            }}/> */}
        </>
    );
}