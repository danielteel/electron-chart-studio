import React, {useState, useRef} from 'react';

import Loading from './Loading';
import Danvas from './Danvas';
import ImagesPane from './ImagesPane';
import Alert from '@mui/material/Alert';


function fileName(path) {
    const start=Math.max(path.lastIndexOf('\\'), path.lastIndexOf('/'))+1;
    return path.substr(start, path.lastIndexOf('.')-start);
}


export default function ImagesTab({project, projectDispatch, imageLibrary}){
    const [progressStatus, setProgressStatus] = useState(null);
    const drawRef = useRef();

    const addImages = (filePaths) => {
        if (typeof filePaths==='string') filePaths=[filePaths];
        if (!Array.isArray(filePaths)) throw new Error('must pass a string or an array of strings to addImage');

        setProgressStatus({title: 'Loading images', value: 0, max: filePaths.length, errored: 0, duplicates: 0});
        for (const file of filePaths){
            const name = fileName(file);
            if (!project.images.has(name)){
                imageLibrary.loadImage(file).then( imageObj =>{
                    projectDispatch('add-image', {name, image: imageObj});
                    setProgressStatus( current => ({...current, value: current.value+1, complete: (current.value+1===filePaths.length)}));
                }).catch( (e) => {
                    setProgressStatus( current => ({...current, value: current.value+1, errored: current.errored+1, complete: (current.value+1===filePaths.length)}));
                });
            }else{
                setProgressStatus( current => ({...current, value: current.value+1, duplicates: current.duplicates+1, complete: (current.value+1===filePaths.length)}));
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


    let message=[];
    if (progressStatus){
        if (progressStatus.errored) message.push(<Alert severity="error">Failed to load {progressStatus.errored} file(s) due to error</Alert>);
        if (progressStatus.duplicates) message.push(<Alert severity='warning'>Failed to load {progressStatus.duplicates} file(s) due to duplicate name(s)</Alert>);
    }

    const redraw = () => {
        const ctx = drawRef.current.getContext('2d');

        ctx.fillStyle='#123123';
        ctx.fillRect(0, 0, drawRef.current.width,  drawRef.current.height);
        const image = project.images.get(project.selectedImage)?.img;
        if (image){
            const zoom = drawRef.current.zoom;
            const origin = drawRef.current.origin;
            const scale = drawRef.current.scale;
            ctx.drawImage(image, origin.x*zoom*scale, origin.y*zoom*scale, image.width*zoom*scale, image.height*zoom*scale);
        }
    }

    return (
        <>
            <Loading open={progressStatus?true:false} progress={progressStatus} message={message} onClose={()=>{
                setProgressStatus(null);
            }}/> 
            <div style={{display: 'flex', flexGrow: 1, overflow: 'hidden',  boxSizing:'border-box'}}>
                <ImagesPane {...{images: project.images, selectedImage: project.selectedImage, addImages, removeImage, setSelectedImage, clearImages}}/>
                <div style={{flexGrow: 1}}>
                    <Danvas style={{width:'100%', height:'100%'}} drawRef={drawRef} onNeedsRedraw={redraw}/>
                </div>
            </div>
        </>
    );
}