import React, {useEffect, useState} from 'react';

import LinearProgress from '@mui/material/LinearProgress';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import { Card, CardActionArea, CardContent, Typography } from '@mui/material';
import { Box, Container, textAlign } from '@mui/system';


const imagesFilter = [{ name: 'Images', extensions: ['apng', 'avif', 'gif', 'jpg', 'jpeg', 'jfif', 'pjpeg', 'pjp', 'png', 'svg', 'webp', 'bmp', 'ico'] }];

function fileName(path) {
    const start=Math.max(path.lastIndexOf('\\'), path.lastIndexOf('/'))+1;
    return path.substr(start, path.lastIndexOf('.')-start);
}

const handleAddImages = async ({setNumberOfImagesBeingLoaded, setImagesLoaded, onImageLoaded}) => {
    try {
        const {filePaths, canceled} = await window.api.dialog.showOpenDialogModal({properties: ['openFile', 'multiSelections'], filters: imagesFilter});

        if (filePaths && !canceled) {
            const newFileList = filePaths.map( filePath => {
                return {filePath: filePath, fileName: fileName(filePath), image: null, error: false};
            })

            const numberOfImagesToLoad=filePaths.length;

            setNumberOfImagesBeingLoaded( current => current+numberOfImagesToLoad);

            for (const file of newFileList) {
                try {
                    const imageBuffer = await window.api.fs.readFile(file.filePath);

                    const blob = new Blob([imageBuffer], {type: 'image/png'});

                    const url = URL.createObjectURL(blob);
                    const img = new Image();
                    img.src = url;

                    img.onload = () => {
                        onImageLoaded(file.fileName, img);
                        setImagesLoaded( current => current+1);
                    }
                    img.onerror = () => {
                        setImagesLoaded( current => current+1);
                    }
                } catch (e){
                    setImagesLoaded( current => current+1);
                };
            }
        }
    } catch (e) {
        console.error('error with open dialog', e);
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


    useEffect( () => {

    }, []);

    return <>
        <Button onClick={ () => {
            setIsOpen(true);
        }}>Add Image(s)</Button>

        <Dialog open={isOpen} onClose={()=>setIsOpen(false)} fullWidth>
            <DialogTitle>
                Add images
            </DialogTitle>
            <DialogContent>
                <Card sx={{borderStyle:'dashed', boxShadow:'none'}}>
                    <CardActionArea onClick={() => handleAddImages({setNumberOfImagesBeingLoaded, setImagesLoaded, onImageLoaded})}
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