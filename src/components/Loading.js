import React from 'react';

import LinearProgress from '@mui/material/LinearProgress';
import Backdrop  from '@mui/material/Backdrop';
import { Box } from '@mui/system';


export default function Loading({open, value, max, title}){
    let progress=value/max*100;
    if (isNaN(progress)) progress=100;
    return (
        <Backdrop open={open}>
            <Box>
                    {title}
                <LinearProgress variant="determinate" value={progress}/>
            </Box>
        </Backdrop>
    );
}