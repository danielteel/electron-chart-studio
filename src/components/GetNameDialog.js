import React, {useEffect, useState} from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export default function GetNameDialog({open, onSubmit, onCancel, validate}) {
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        setName('');
        if (open){
            const selectedElement = window.activeElement;
            if (selectedElement){
                selectedElement.blur();
                return () => {
                    if (selectedElement) selectedElement.focus();
                }
            }
        }
    }, [open]);

    useEffect(() => {
        if (name.trim()===''){
            setError(null);
            return;
        }

        const errorMessage = validate(name);
        if (errorMessage) {
            setError(errorMessage);
        }else{
            setError(null);
        }
    }, [open, name, validate]);

    return (
        <Dialog open={open}
            onClose={onCancel}>
            <DialogTitle>Name new chart</DialogTitle>
            <DialogContent>
                <TextField value={name}
                    onChange={
                        (e) => {
                            setName(e.target.value);
                        }
                    }
                    error={!!error}
                    helperText={error}
                    autoFocus
                    margin="dense"
                    id="name"
                    label="Name"
                    type="text"
                    fullWidth
                    variant="standard"/>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel}>Cancel</Button>
                <Button onClick={
                    () => {
                        if (!validate(name)){
                            onSubmit(name);
                        }
                    }
                }>Create</Button>
            </DialogActions>
        </Dialog>
    );
}
