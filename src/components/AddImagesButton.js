import React, {useEffect, useState} from 'react';

import LinearProgress from '@mui/material/LinearProgress';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import { Card, CardActionArea, CardContent, Typography } from '@mui/material';
import { Box } from '@mui/system';


const imagesFilter = [{ name: 'Images', extensions: ['apng', 'avif', 'gif', 'jpg', 'jpeg', 'jfif', 'pjpeg', 'pjp', 'png', 'svg', 'webp', 'bmp', 'ico'] }];

function fileName(path) {
    const start=Math.max(path.lastIndexOf('\\'), path.lastIndexOf('/'))+1;
    return path.substr(start, path.lastIndexOf('.')-start);
}

const handleAddImagesDialog = async({setNumberOfImagesBeingLoaded, setImagesLoaded, onImageLoaded}) => {
    try {
        const {filePaths, canceled} = await window.api.dialog.showOpenDialogModal({properties: ['openFile', 'multiSelections'], filters: imagesFilter});
        if (filePaths && !canceled) await handleAddImages({setNumberOfImagesBeingLoaded, setImagesLoaded, onImageLoaded, filePaths})
    } catch (e) {
        console.error("handleAddImagesDialog", e);
    }
}

const handleAddImages = async ({setNumberOfImagesBeingLoaded, setImagesLoaded, onImageLoaded, filePaths}) => {
    if (filePaths) {
        const numberOfImagesToLoad = filePaths.length;

        setNumberOfImagesBeingLoaded( current => current + numberOfImagesToLoad);

        for (const file of filePaths) {
            try {
                const imageBuffer = await window.api.fs.readFile(file);

                const blob = new Blob([imageBuffer], {type: 'image/png'});

                const url = URL.createObjectURL(blob);
                const img = new Image();
                img.src = url;

                img.onload = () => {
                    onImageLoaded(fileName(file), img);
                    setImagesLoaded( current => current + 1);
                }
                img.onerror = () => {
                    setImagesLoaded( current => current + 1);
                }
            } catch (e){
                setImagesLoaded( current => current + 1);
            };
        }
    }
}


export default function AddImagesButton({addImage}){
    const [isOpen, setIsOpen] = useState(false);
    const [numberOfImagesBeingLoaded, setNumberOfImagesBeingLoaded] = useState(0);
    const [imagesLoaded, setImagesLoaded] = useState(0);

    useEffect( () => {
        if (imagesLoaded!==0 && numberOfImagesBeingLoaded!==0){
            if (imagesLoaded===numberOfImagesBeingLoaded){
                setImagesLoaded(0);
                setNumberOfImagesBeingLoaded(0);
            }
        }
    }, [imagesLoaded, numberOfImagesBeingLoaded]);

    const onImageLoaded = (imageName, image) => {
        addImage(imageName, image);
    }

    const OnDragOver=(e)=>{
        e.preventDefault();
    }
    const onDrop=(e)=>{
        e.preventDefault();
        if (e.dataTransfer.items) {
            const filePaths = [...e.dataTransfer.items].filter( item => item.kind==='file').map( item => item.getAsFile().path );
            handleAddImages({setNumberOfImagesBeingLoaded, setImagesLoaded, onImageLoaded, filePaths})
        }
    }

    return <>
        <Button onClick={ () => {
            setIsOpen(true);
        }}>Add Image(s)</Button>

        <Dialog open={isOpen} onClose={()=>setIsOpen(false)} fullWidth>
            <DialogTitle>
                Add images
            </DialogTitle>
            <DialogContent>
                <Card sx={{borderStyle:'dashed', boxShadow:'none'}} onDragOver={OnDragOver} onDrop={onDrop}>
                    <CardActionArea onClick={() => handleAddImagesDialog({setNumberOfImagesBeingLoaded, setImagesLoaded, onImageLoaded})}
                     sx={{minHeight: '200px', display:'flex', alignItems:'center', justifyItems:'center'}}>
                            <CardContent>
                                    <Typography variant="h5">Drag files or click here to add</Typography>
                            </CardContent>
                    </CardActionArea>
                </Card>
                {
                    numberOfImagesBeingLoaded ?
                        <>
                            <Box>
                                <Typography variant="body2" color="text.secondary">Loading images {imagesLoaded}/{numberOfImagesBeingLoaded}</Typography>
                            </Box>
                            <LinearProgress variant="determinate" value={imagesLoaded/numberOfImagesBeingLoaded*100}/>
                        </>
                    :
                        null
                }
            </DialogContent>
            <DialogActions>
                <Button onClick={()=>setIsOpen(false)}>Close</Button>
            </DialogActions>
        </Dialog>
    </>
}