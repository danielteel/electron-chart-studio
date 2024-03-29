import React, { useReducer, useRef, useState } from 'react';


import ImageLibrary from '../lib/ImageLibrary';
import ImagesTab from './ImagesTab';




const imageLibrary = new ImageLibrary();



function projectReducer(state, action){
    const payload = action.payload;

    switch (action.type){
        case 'select-image':{
            if (state.images.has(payload)){
                return {...state, selectedImage: payload};
            }else{
                console.error('projectReducer: tried to select image thats not in the list');
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
            let name=payload.name;
            if (state.images.has(payload.name)){
                let nameCount=0;
                while (state.images.has(name+String(nameCount))){
                    nameCount++;
                }
                name+=String(nameCount);
            }

            const newImages = new Map(state.images);
            newImages.set(name, payload.image);
            return {...state, images: newImages};
        }

        case 'new-chart':{
            const {name, dontSelect} = payload;
            const imageToAddTo = state.images.get(state.selectedImage);
            if (!imageToAddTo){
                console.error('projectReducer: tried to add a chart not associated with an image');
                return state;
            }

            if (state.charts.has(name)){
                console.error('projectReducer: tried to add a chart with same name as another chart');
                return state;
            }

            const newCharts = new Map(state.charts);
            newCharts.set(name, {image: state.selectedImage, bounds: {left: 0, top: 0, right: 0, bottom: 0}});
            const newSelectedChart = dontSelect ? state.selectedChart : name;
            return {...state, charts: newCharts, selectedChart: newSelectedChart};
        }

        default:
            throw new Error('projectReducer: unknown action type ', action.type);
    }
}

const initialProjectState = {
    images: new Map(),
    charts: new Map(),
    selectedImage: null,
    selectedChart: null
}


export default function App(){
    const [project, _projectDispatch] = useReducer(projectReducer, initialProjectState)
    const projectDispatch = (type, payload) => _projectDispatch({type, payload});

    return (
        <>
            <div style={{display:'flex', flexDirection:'column', width:'100%', height:'100%', boxSizing:'border-box'}}>
                <div style={{display: 'flex',  boxSizing:'border-box'}}>
                    Toolbar
                </div>   
                <div style={{display: 'flex',  boxSizing:'border-box'}}>
                    Tabs
                </div>   
                <ImagesTab project={project} projectDispatch={projectDispatch} imageLibrary={imageLibrary}/>
            </div>
        </>
    );
}