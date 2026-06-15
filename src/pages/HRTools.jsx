import React from 'react';
import { Link } from 'react-router-dom';

export default function HRTools(){
  return (
    <div style={{padding:20}}>
      <h2>HR Tools</h2>
      <ul>
        <li><Link to="/applicants">Applicants</Link></li>
        <li><Link to="/pipeline">Pipeline</Link></li>
        <li><Link to="/talent-pool">Talent Pool</Link></li>
        <li><Link to="/referrals">Referrals</Link></li>
        <li><a href="#" onClick={(e)=>{e.preventDefault(); alert('Screening tools (TODO)')}}>Screening</a></li>
        <li><a href="#" onClick={(e)=>{e.preventDefault(); alert('Offers management (TODO)')}}>Offer Management</a></li>
        <li><a href="#" onClick={(e)=>{e.preventDefault(); alert('Background checks (TODO)')}}>Background Verification</a></li>
      </ul>
    </div>
  )
}
