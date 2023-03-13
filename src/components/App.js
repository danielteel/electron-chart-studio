import React, { useState, useReducer, useRef } from 'react';

import Canvas from './Canvas';
import ImagesPane from './ImagesPane';

import tryToLoadImage from '../functions/tryToLoadImage';

import { useMeasure } from "@reactivers/use-measure";




function projectReducer(state, action){
    const payload = action.payload;

    switch (action.type){
        case 'select-image':{
            if (state.images.has(payload)){
                return {...state, selectedImage: payload};
            }
            return state;
        }

        case 'clear-images':{
            const newImages = new Map(state.images);
            for (const [key, image] of newImages){
                image.cleanup();
                newImages.delete(key);
            }
            if (typeof window.gc==='function') window.gc();//Try and reclaim memory if gc is exposed
            return {...state, selectedImage: null, images: newImages};
        }

        case 'remove-image':{
            const hasName = state.images.has(payload);
            if (hasName){
                const newImages = new Map(state.images);
                newImages.get(payload).cleanup();
                newImages.delete(payload);
                let newSelectedImage = state.selectedImage;
                if (hasName===state.selectedImage){
                    newSelectedImage=null;
                }
                return {...state, selectedImage: newSelectedImage, images: newImages};
            }
            return state;
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
    selectedImage: null
}

export default function App(){
    const [project, _projectDispatch] = useReducer(projectReducer, initialProjectState)
    const projectDispatch = (type, payload) => _projectDispatch({type, payload});

    const appRef = useRef();
    const {width, height} = useMeasure({ref: appRef, updateOnWindowResize: true});

    const addImage = (file) => {
        return tryToLoadImage(project.images, file, (imageObj) => {
            projectDispatch('add-image', imageObj); 
        });
    }

    const removeImage = (imageName) => {
        projectDispatch('remove-image', imageName);
    }

    const setSelectedImage = (imageName) => {
        projectDispatch('select-image', imageName);
    }

    return (
        <div ref={appRef} style={{display: 'flex', width:'100%'}}>
            <ImagesPane images={project.images} addImage={addImage} removeImage={removeImage} selectedImage={project.selectedImage} setSelectedImage={setSelectedImage}/>
            <Canvas width={width-600} height={height} backgroundColor='white' draw={ (ctx, drawFns) => {
                if (project.selectedImage){
                    drawFns.drawImage(project.images.get(project.selectedImage).image, 0, 0);
                }
            }}/>
            <ImagesPane images={project.images} addImage={addImage} removeImage={removeImage} selectedImage={project.selectedImage} setSelectedImage={setSelectedImage}/>
        </div>
    );
}