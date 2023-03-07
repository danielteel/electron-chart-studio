import React, { useState } from 'react';

import Canvas from './Canvas';
import ImageLoadStatus from './ImageLoadStatus';

let buttonInUse = false;

const imagesFilter = [{ name: 'Images', extensions: ['jpg', 'png', 'gif', 'bmp'] }];

export default function App({}){
    const [images, setImages] = useState([]);
    const [fileList, setFileList] = useState([]);
    const [imageLoadStatusOpen, setImageLoadStatusOpen] = useState(false);
    return (
        <>
            <button type='button' onClick={ async () => {
                try {
                    if (buttonInUse) return;
                    buttonInUse=true;
                    const filePaths = await window.api.dialog.showOpenDialogModal({properties: ['openFile', 'multiSelections'], filters: imagesFilter});
                    if (filePaths){
                        
                        const newFileList = filePaths.map( filePath => {
                            return {filePath: filePath, status: null};
                        })
                        setFileList(newFileList);
                        setImageLoadStatusOpen(true);

                        for (const file of newFileList){
                            window.api.readFile(file.filePath).then( imageBuffer => {
                                const blob = new Blob([imageBuffer], { type: 'image/png' });
                                
                                const url = URL.createObjectURL(blob);
                                const img = new Image();
                                img.src = url;
                                img.onload = () => {
                                    setImages( (current => {
                                        const newList = [...current];
                                        newList.push({file: file.filePath, image: img});
                                        return newList;
                                    }));
                                    setFileList( (current) => {
                                        const thisItem = current.find(item => item.filePath === file.filePath);
                                        if (thisItem){
                                            thisItem.status='loaded';
                                            const newList = current.filter( item => item.filePath !== file.filePath);
                                            newList.push(thisItem);
                                            return newList;
                                        }else{
                                            return current;
                                        }
                                    });
                                }
                                img.onerror = () => {
                                    setFileList( (current) => {
                                        const thisItem = current.find(item => item.filePath === file.filePath);
                                        if (thisItem){
                                            thisItem.status='error';
                                            const newList = current.filter( item => item.filePath !== file.filePath);
                                            newList.unshift(thisItem);
                                            return newList;
                                        }else{
                                            return current;
                                        }
                                    });
                                }
                            }).catch( error => {
                                setFileList( (current) => {
                                    const thisItem = current.find(item => item.filePath === file.filePath);
                                    if (thisItem){
                                        thisItem.status='error';
                                        const newList = current.filter( item => item.filePath !== file.filePath);
                                        newList.unshift(thisItem);
                                        return newList;
                                    }else{
                                        return current;
                                    }
                                });
                            });
                        }
                    }
                } catch (e) {
                }
                buttonInUse=false;
            }}>Open</button>

            <ImageLoadStatus fileList={fileList} isOpen={imageLoadStatusOpen} onClose={()=>setImageLoadStatusOpen(false)}/>

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