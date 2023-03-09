import React, {useState} from 'react';

import CheckIcon from '@mui/icons-material/Check';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import { Typography } from '@mui/material';


const imagesFilter = [{ name: 'Images', extensions: ['apng', 'avif', 'gif', 'jpg', 'jpeg', 'jfif', 'pjpeg', 'pjp', 'png', 'svg', 'webp', 'bmp', 'ico'] }];

function fileName(path) {
    const start=Math.max(path.lastIndexOf('\\'), path.lastIndexOf('/'))+1;
    return path.substr(start, path.lastIndexOf('.')-start);
}

const handleAddImages = async ({setAddedImageList, onImageLoaded}) => {
    try {
        const filePaths = await window.api.dialog.showOpenDialogModal({properties: ['openFile', 'multiSelections'], filters: imagesFilter});

        if (filePaths) {
            const newFileList = filePaths.map( filePath => {
                return {filePath: filePath, fileName: fileName(filePath), image: null, error: false};
            })

            setAddedImageList(newFileList);
    
            for (const file of newFileList) {
                window.api.readFile(file.filePath).then(imageBuffer => {
                    const blob = new Blob([imageBuffer], {type: 'image/png'});
    
                    const url = URL.createObjectURL(blob);
                    const img = new Image();
                    img.src = url;

                    img.onload = () => {
                        onImageLoaded(file.fileName, img);

                        setAddedImageList( (current) => {
                            const thisItem = current.find(item => item.filePath === file.filePath);
                            if (!thisItem) return current;

                            thisItem.image=img;
                            const newList = current.filter(item => item.filePath !== file.filePath);
                            newList.push(thisItem);
                            return newList;
                        });
                    }
                    img.onerror = () => {
                        setAddedImageList( (current) => {
                            const thisItem = current.find(item => item.filePath === file.filePath);
                            if (!thisItem) return current;

                            thisItem.error = true;
                            const newList = current.filter(item => item.filePath !== file.filePath);
                            newList.unshift(thisItem);
                            return newList;
                        });
                    }
                }).catch(error => {
                    setAddedImageList( (current) => {
                        const thisItem = current.find(item => item.filePath === file.filePath);
                        if (!thisItem) return current;

                        thisItem.error = true;
                        const newList = current.filter(item => item.filePath !== file.filePath);
                        newList.unshift(thisItem);
                        return newList;
                    });
                });
            }
        }
    } catch (e) {
        console.error('error with open dialog', e);
    }
}


export default function AddImagesButton({addImage}){
    const [isOpen, setIsOpen] = useState(false);
    const [addedImageList, setAddedImageList] = useState([]);

    const onImageLoaded = (imageName, image) => {
        addImage(imageName, image);
    }

    let allImagesProcessed = true;
    let errorLoadingImage = 0;

    const listItems = addedImageList?.map(file => {
        if (file.error) errorLoadingImage++;
        if (!file.error && !file.image) allImagesProcessed=false;
        return (
            <ListItem>
                <ListItemIcon>
                    {
                        file.error?
                            <ErrorOutlineIcon/>
                        :!file.image?
                            <HourglassBottomIcon/>
                        :
                            <CheckIcon/>
                    }
                </ListItemIcon>
                {file.fileName}
            </ListItem>
        );
    });

    if (addedImageList?.length===0){
        allImagesProcessed=false;
        errorLoadingImage=0;
    }

    return <>
    <button type='button' onClick={ () => {
        setIsOpen(true);
        setAddedImageList((current)=>{
            return current.filter( item => !(item.error||item.image) );
        });
        handleAddImages({setAddedImageList, onImageLoaded});
    }}>Add Image(s)</button>
    <Dialog open={isOpen} onClose={()=>setIsOpen(false)}>
        <DialogTitle>
          Adding Images...
        </DialogTitle>
        <DialogContent>
          <List>
            {listItems}
          </List>
        </DialogContent>
        <DialogActions>
            <Typography variant='h6'>
                {
                errorLoadingImage && allImagesProcessed?
                    Number(errorLoadingImage)+" image(s) failed to load, all the other images were loaded just fine."
                :allImagesProcessed?
                    "All images have been loaded."
                :
                    null
                }
            </Typography>
            <Button onClick={()=>setIsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
}