import React, { useEffect, useState } from 'react';
import api from '../api';
import { List, ListItem, ListItemText, Button, Box, Typography, Paper } from '@mui/material';

export default function Applicants(){
  const [items, setItems] = useState([]);
  const load = async ()=>{
    try{
      const res = await api.get('/ats/applicants');
      setItems(res.data);
    }catch(e){console.error(e)}
  }
  useEffect(()=>{load()},[])
  return (
    <Box>
      <Typography variant="h5" sx={{mb:2}}>Applicants</Typography>
      <Paper sx={{p:2}}>
        <List>
          {items.map(a=> (
            <ListItem key={a.id} secondaryAction={<Button href={`#/applicant/${a.id}`}>Open</Button>}>
              <ListItemText primary={a.full_name} secondary={`${a.email} • ${a.created_at}`} />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  )
}
