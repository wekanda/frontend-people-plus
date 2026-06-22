import React, { useEffect, useState } from 'react';
import api from '../api';
import { Box, Paper, Typography, Grid, Button } from '@mui/material';

export default function Pipeline(){
  const [board, setBoard] = useState({});
  const load = async ()=>{
    try{
      const res = await api.get('/ats/pipeline', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setBoard(res.data);
    }catch(e){console.error(e)}
  }
  useEffect(()=>{load()},[])
  return (
    <Box>
      <Typography variant="h5" sx={{mb:2}}>Recruitment Pipeline</Typography>
      <Grid container spacing={2}>
        {Object.keys(board).map((stage)=> (
          <Grid item xs={12} md={3} key={stage}>
            <Paper sx={{p:2}}>
              <Typography variant="subtitle1">{stage} ({board[stage].length})</Typography>
              {board[stage].map(entry=> (
                <Box key={entry.application.id} sx={{borderTop:'1px solid #eee', pt:1, mt:1}}>
                  <Typography>{entry.application.applicant_name}</Typography>
                  <Typography color="text.secondary">{entry.application.email}</Typography>
                  <Button size="small" href={`#/applicant/${entry.application.id}`}>Open</Button>
                </Box>
              ))}
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
