import React, {useState} from 'react';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Box from '@mui/material/Box';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Paper from '@mui/material/Paper';

import { Typography } from '@mui/material';


import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import LayersClearIcon from '@mui/icons-material/LayersClear';
import { ListItemButton } from '@mui/material';


const imagesFilter = [{ name: 'Images', extensions: ['apng', 'avif', 'gif', 'jpg', 'jpeg', 'jfif', 'pjpeg', 'pjp', 'png', 'svg', 'webp', 'bmp', 'ico'] }];

const handleAddImagesDialog = async({addImages}) => {
    try {
        const {filePaths, canceled} = await window.api.dialog.showOpenDialogModal({properties: ['openFile', 'multiSelections'], filters: imagesFilter});
        if (filePaths && !canceled){
            addImages(filePaths);
        }
    } catch (e) {
        console.error("handleAddImagesDialog", e);
    }
}


export default function ImagesPane({images, addImages, removeImage, selectedImage, setSelectedImage, clearImages}){
    const [isDragging, setIsDragging] = useState(0);


    const list=[];
    for (const [name, image] of images){
        list.push(
            <ListItem key={name} onKeyDown={(e)=>console.log(e)}>
                <ListItemButton selected={name===selectedImage} onClick={()=>setSelectedImage(name)}>
                    <ListItemAvatar>
                        <Avatar variant='rounded' src={image.img.src} />
                    </ListItemAvatar>
                    <ListItemText>
                        {name}
                    </ListItemText>
                </ListItemButton>
            </ListItem>
        );
    }

    const onDragOver=(e)=>{
        e.preventDefault();
        setIsDragging(true);
    }
    const onDragLeave=(e)=>{
        e.preventDefault();
        setIsDragging(false);
    }
    const onDrop=(e)=>{
        e.preventDefault();
        if (e.dataTransfer.items) {
            const filePaths = [...e.dataTransfer.items].filter( item => item.kind==='file').map( item => item.getAsFile().path );
            addImages(filePaths);
        }
        setIsDragging(false);
    }

    return (
            <Paper variant='outlined' sx={{display: 'flex', flexDirection: 'column', maxHeight: '100%', minWidth:'280px', width: '280px', borderStyle:isDragging?'dashed':null}} onDragOver={onDragOver} onDrop={onDrop} onDragLeave={onDragLeave}>
                <Box sx={{display: 'flex'}}>
                    <Typography variant='h6' sx={{flexGrow:1, textAlign:'center'}}>
                        Images
                    </Typography>
                    <IconButton children={<AddIcon/>} onClick={()=>{
                        handleAddImagesDialog({addImages});
                    }}/>
                    <IconButton disabled={!images.has(selectedImage)} children={<ClearIcon/>} onClick={()=>{
                        removeImage(selectedImage);
                    }}/>
                    <IconButton disabled={images.size===0} children={<LayersClearIcon/>} onClick={()=>{
                        clearImages();
                    }}/>
                </Box>
                <Box sx={{overflowY: 'auto', overflowX: 'hidden', flexGrow:1, display: 'flex', flexDirection:'column'}}>
                    <List dense sx={{flexGrow: 1}}>
                        {list}
                    </List>
                </Box>
            </Paper>
    );
}