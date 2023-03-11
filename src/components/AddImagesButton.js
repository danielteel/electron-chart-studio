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



const handleAddImagesDialog = async({setNumberOfImagesBeingLoaded, setImagesLoaded, tryToAddImage}) => {
    try {
        const {filePaths, canceled} = await window.api.dialog.showOpenDialogModal({properties: ['openFile', 'multiSelections'], filters: imagesFilter});
        if (filePaths && !canceled) await handleAddImages({setNumberOfImagesBeingLoaded, setImagesLoaded, tryToAddImage, filePaths})
    } catch (e) {
        console.error("handleAddImagesDialog", e);
    }
}

const handleAddImages = async ({setNumberOfImagesBeingLoaded, setImagesLoaded, tryToAddImage, filePaths}) => {
    if (filePaths) {
        const numberOfImagesToLoad = filePaths.length;

        setNumberOfImagesBeingLoaded( current => current + numberOfImagesToLoad);

        for (const file of filePaths) {
            tryToAddImage(file).then( ()=>{
                setImagesLoaded( current => current + 1);
            });
        }
    }
}


export default function AddImagesButton({tryToAddImage}){
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

    const OnDragOver=(e)=>{
        e.preventDefault();
    }
    const onDrop=(e)=>{
        e.preventDefault();
        if (e.dataTransfer.items) {
            const filePaths = [...e.dataTransfer.items].filter( item => item.kind==='file').map( item => item.getAsFile().path );
            handleAddImages({setNumberOfImagesBeingLoaded, setImagesLoaded, tryToAddImage, filePaths})
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
                    <CardActionArea sx={{minHeight: '200px', display:'flex', alignItems:'center', justifyItems:'center'}} onClick={()=>handleAddImagesDialog({setNumberOfImagesBeingLoaded, setImagesLoaded, tryToAddImage})}>
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