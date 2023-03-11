import React from 'react';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

export default function ImagesPane({images}){

    let list=[];
    for (const [name, image] of images){
        list.push(
            <ListItem key={name}>
                <ListItemAvatar>
                    <Avatar variant='rounded' src={image.image.src} />
                </ListItemAvatar>
                <ListItemText>
                    {name}
                </ListItemText>
            </ListItem>
        );
    }

    return (
        <Paper sx={{overflowY: 'auto', overflowX: 'hidden', width: '260px', height: '100vh'}}>
            <List dense>
                {list}
            </List>
        </Paper>
    );
}