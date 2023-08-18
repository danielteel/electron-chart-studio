import React, {useEffect} from 'react';

import LinearProgress from '@mui/material/LinearProgress';
import Backdrop  from '@mui/material/Backdrop';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/system/Stack';
import Box from '@mui/material/Box';


export default function Loading({open, onClose, progress, message}){

    useEffect(() => {
        if (open){
            const selectedElement = document.activeElement;
            if (selectedElement){
                selectedElement.blur();
                return () => {
                    if (selectedElement) selectedElement.focus();
                }
            }
        }
    }, [open]);

    if (!progress) return null;
    let percent=progress.value/progress.max*100;
    if (isNaN(percent)) percent=100;
    return (
        <Backdrop open={open} sx={{zIndex:10000}}>
            <Paper sx={{padding:'15px', minWidth:'300px'}}>
                <Stack spacing='20px'>
                    <Typography variant='h6' sx={{width:'100%', textAlign:'center'}}>{progress.title}</Typography>
                    <Box sx={{display:'flex', alignItems:'center'}}>
                        <Box sx={{width:'100%', mr: 1}}>
                            <LinearProgress variant="determinate" value={percent}/>
                        </Box>
                        <Typography variant='caption'>{Math.floor(percent)}%</Typography>
                    </Box>
                    {message}
                    <Button variant='contained' disabled={!progress.complete} onClick={()=>onClose()}>Ok</Button>
                </Stack>
            </Paper>
        </Backdrop>
    );
}