import React from 'react';

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

export default function ImageLoadStatus({fileList, isOpen, onClose}){
    
    if (isOpen){
        let anyLeftToLoad=false;

        for (const file of fileList){
            if (file.status==='error' || !file.status){
                anyLeftToLoad=true;
            }
        }

        if (!anyLeftToLoad) onClose();
    }

    return <>
    <Dialog
        open={isOpen}
        onClose={onClose}
      >
        <DialogTitle>
          Image Load Status
        </DialogTitle>
        <DialogContent>
          <List>
            {fileList?.map(file => {
                return <ListItem>
                    <ListItemIcon>
                        {
                            !file.status?
                                <HourglassBottomIcon/>
                            :file.status==='error'?
                                <ErrorOutlineIcon/>
                            :
                                <CheckIcon/>
                        }
                    </ListItemIcon>
                    {file.filePath}
                </ListItem>
            })}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
}