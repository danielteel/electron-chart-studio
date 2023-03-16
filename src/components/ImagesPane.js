import React, {useState, useEffect, useRef} from 'react';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Box from '@mui/material/Box';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { Typography } from '@mui/material';

import LinearProgress from '@mui/material/LinearProgress';

import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import { ListItemButton } from '@mui/material';


const handleAddImages = async ({addImage, filePaths, setShowLoading, loadingTimeout}) => {
    if (filePaths) {
        const numberOfImagesToLoad = filePaths.length;

        if (loadingTimeout.current){
            clearTimeout(loadingTimeout.current);
            loadingTimeout.current=null;
        }

        setShowLoading( current => {
            if (current){
                return {...current, numToLoad: current.numToLoad+numberOfImagesToLoad};
            } else {
                return {numToLoad: numberOfImagesToLoad, loaded: 0, numFailed: 0} 
            }
        } );

        const loadPromises = [];
        for (const file of filePaths) {
            loadPromises.push(addImage(file).then( (imageName) => {
                if (imageName){
                    setShowLoading( current => {
                        return {...current, loaded: current.loaded+1};
                    })
                }else{
                    setShowLoading( current => {
                        return {...current, numToLoad: current.numToLoad-1, numFailed: current.numFailed+1};
                    })
                }
            }));
        }

        await Promise.allSettled(loadPromises);

        if (loadingTimeout.current){
            clearTimeout(loadingTimeout.current);
            loadingTimeout.current=null;
        }
        setShowLoading(current => {
            loadingTimeout.current = setTimeout(()=>{
                setShowLoading(null);
            }, current.numFailed?4000:1000);
            return current;
        })

    }
}

const imagesFilter = [{ name: 'Images', extensions: ['apng', 'avif', 'gif', 'jpg', 'jpeg', 'jfif', 'pjpeg', 'pjp', 'png', 'svg', 'webp', 'bmp', 'ico'] }];

const handleAddImagesDialog = async({addImage, setShowLoading, loadingTimeout}) => {
    try {
        const {filePaths, canceled} = await window.api.dialog.showOpenDialogModal({properties: ['openFile', 'multiSelections'], filters: imagesFilter});
        if (filePaths && !canceled) await handleAddImages({addImage, filePaths, setShowLoading, loadingTimeout})
    } catch (e) {
        console.error("handleAddImagesDialog", e);
    }
}


export default function ImagesPane({images, addImage, removeImage, selectedImage, setSelectedImage}){
    const [isDragging, setIsDragging] = useState(0);
    const [showLoading, setShowLoading] = useState(null);
    const loadingTimeout = useRef(null);


    useEffect( ()=>{
        return () => {
            if (loadingTimeout.curent) clearTimeout(loadingTimeout.current);
            loadingTimeout.current = null;
        }
    }, []);

    let loadingAlert=null;
    if (showLoading){
        loadingAlert=(
            <Alert severity={showLoading.numFailed?'warning':showLoading.loaded===showLoading.numToLoad?'success':'info'}>
                <AlertTitle>Loading {showLoading.loaded}/{showLoading.numToLoad}</AlertTitle>
                <LinearProgress variant="determinate" value={showLoading.loaded/showLoading.numToLoad*100}/>
                {
                    showLoading.numFailed?
                        "Failed to load "+showLoading.numFailed+" file(s), wrong format or image is already loaded with the same name"
                    :
                        null
                }
            </Alert>
        )
    }

    let list=[];
    for (const [name, image] of images){
        list.push(
            <ListItem key={name}>
                <ListItemButton selected={name===selectedImage} onClick={()=>setSelectedImage(name)}>
                    <ListItemAvatar>
                        <Avatar variant='rounded' src={image.image.src} />
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
            handleAddImages({addImage, filePaths, setShowLoading, loadingTimeout})
        }
        setIsDragging(false);
    }

    return (
            <Paper variant='outlined' sx={{display: 'flex', flexDirection: 'column', maxHeight: '100%', width: '280px', borderStyle:isDragging?'dashed':null}} onDragOver={onDragOver} onDrop={onDrop} onDragLeave={onDragLeave}>
                <Box sx={{display: 'flex'}}>
                    <Typography variant='h6' sx={{flexGrow:1, textAlign:'center'}}>
                        Pages
                    </Typography>
                    <IconButton children={<AddIcon/>} onClick={()=>{
                        handleAddImagesDialog({addImage, setShowLoading, loadingTimeout});
                    }}/>
                    <IconButton disabled={!images.has(selectedImage)} children={<ClearIcon/>} onClick={()=>{
                        removeImage(selectedImage);
                    }}/>
                </Box>
                {loadingAlert}
                <Box sx={{overflowY: 'auto', overflowX: 'hidden', flexGrow:1, display: 'flex', flexDirection:'column'}}>
                    <List dense sx={{flexGrow:1}}>
                        {list}
                    </List>
                </Box>
            </Paper>
    );
}