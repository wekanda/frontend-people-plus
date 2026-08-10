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
        <li><Link to="/applicants">Screening</Link></li>
        <li><Link to="/offers">Offer Management</Link></li>
        <li><Link to="/background-checks">Background Verification</Link></li>
      </ul>
    </div>
  )
}
