import React, {useState, useEffect} from 'react';
import api from '../api';

export default function Referrals(){
  const [items, setItems] = useState([])
  const [form, setForm] = useState({full_name:'', email:'', phone:''})

  useEffect(()=>{ fetchList() }, [])
  function fetchList(){
    api.get('/hr/referrals').then(r=>setItems(r.data)).catch(()=>setItems([]))
  }
  function submit(e){
    e.preventDefault()
    api.post('/hr/referral', form).then(()=>{ fetchList(); setForm({full_name:'', email:'', phone:''}) })
  }
  return (
    <div style={{padding:20}}>
      <h2>Referrals</h2>
      <form onSubmit={submit} style={{marginBottom:20}}>
        <input placeholder="Full name" value={form.full_name} onChange={e=>setForm({...form, full_name:e.target.value})} />
        <input placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
        <input placeholder="Phone" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} />
        <button type="submit">Refer</button>
      </form>
      <ul>
        {items.map(i=>(<li key={i.id}>{i.full_name} — {i.email} — {i.phone}</li>))}
      </ul>
    </div>
  )
}
