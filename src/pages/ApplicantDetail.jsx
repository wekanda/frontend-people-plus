import React, { useEffect, useState } from 'react';
import api from '../api';
import { useParams } from 'react-router-dom';
import { Box, Typography, Paper, Button, TextField } from '@mui/material';

export default function ApplicantDetail(){
  const { id } = useParams();
  const [app, setApp] = useState(null);
  const [note, setNote] = useState('');

  const load = async ()=>{
    try{
      const res = await api.get('/ats/applicants');
      const a = res.data.find(x=>x.id===parseInt(id));
      setApp(a);
    }catch(e){console.error(e)}
  }
  useEffect(()=>{load()},[])

  const sendNote = async ()=>{
    try{
      // simple: create application stage
      await api.post(`/ats/applications/${id}/advance`, { stage: 'note', status: 'noted', note });
      alert('Saved');
    }catch(e){console.error(e); alert('Failed')}
  }

  if(!app) return <div>Loading...</div>
  return (
    <Box>
      <Typography variant="h5">{app.full_name}</Typography>
      <Typography color="text.secondary">{app.email} • {app.phone}</Typography>
      <Paper sx={{p:2, mt:2}}>
        <Typography variant="subtitle1">Resume</Typography>
        {app.resume_url ? <a href={app.resume_url}>Download</a> : <Typography>No resume uploaded</Typography>}
      </Paper>
      <Paper sx={{p:2, mt:2}}>
        <TextField label="Note" value={note} onChange={e=>setNote(e.target.value)} fullWidth multiline rows={4} />
        <Button sx={{mt:1}} variant="contained" onClick={sendNote}>Save Note</Button>
      </Paper>
    </Box>
  )
}
