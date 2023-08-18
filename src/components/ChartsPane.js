import React, {useState} from 'react';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
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

import GetNameDialog from './GetNameDialog';


export default function ChartsPane({charts, newChart, selectedChart, selectedImage}){
    const [getNameDialogOpen, setGetNameDialogOpen] = useState(false);

    const checkName = (text) => {
        if (text.trim()===''){
            return 'Name must not be empty';
        }
        const name = text.trim();
        if (charts.has(name)){
            return 'Name is already defined';
        }
        return null;
    }

    const list=[];
    for (const [name, chart] of charts){
        list.push(
            <ListItem key={name} onKeyDown={(e)=>console.log(e)}>
                <ListItemButton selected={name===selectedChart}>
                    <ListItemText>
                        {name}
                    </ListItemText>
                </ListItemButton>
            </ListItem>
        );
    }
    return (
        <>
            <GetNameDialog open={getNameDialogOpen} onSubmit={(name)=>{newChart(name);setGetNameDialogOpen(false)}} onCancel={()=>setGetNameDialogOpen(false)} validate={checkName}/>
            <Paper variant='outlined' sx={{display: 'flex', flexDirection: 'column', maxHeight: '100%', minWidth:'260px', width: '260px'}}>
                <Box sx={{display: 'flex'}}>
                    <Typography variant='h6' sx={{flexGrow:1, textAlign:'center'}}>
                        Charts
                    </Typography>
                    <IconButton disabled={!selectedImage} children={<AddIcon/>} onClick={()=>{
                        setGetNameDialogOpen(true);
                    }}/>
                    <IconButton disabled={!selectedChart} children={<ClearIcon/>} onClick={()=>{
                    }}/>
                </Box>
                <Box sx={{overflowY: 'auto', overflowX: 'hidden', flexGrow:1, display: 'flex', flexDirection:'column'}}>
                    <List dense sx={{flexGrow: 1}}>
                        {list}
                    </List>
                </Box>
            </Paper>
        </>
    );
}