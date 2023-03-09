import React, { useState } from 'react';

import Canvas from './Canvas';
import AddImagesButton from './AddImagesButton';

export default function App(){
    const [images, setImages] = useState([]);
    return (
        <>
            <AddImagesButton addImage={(imageName, image)=>{
                setImages((current)=>{
                    return [...current, {imageName, image}];
                })
            }}/>

            <Canvas backgroundColor='white' draw={ (ctx, drawFns) => {
                let drawX = 0;
                for (const image of images){
                    drawFns.drawImage(image.image, drawX, 0);
                    drawX+=image.image.width;
                }
            }}/>
        </>
    );
}