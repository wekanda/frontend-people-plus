import React, { useState, useEffect } from 'react';
import api from '../api';

export default function BackgroundChecks() {
  const [checks, setChecks] = useState([]);
  const [formCheck, setFormCheck] = useState({ application_id: '', type: 'basic' });

  useEffect(() => { fetchChecks(); }, []);

  function fetchChecks() {
    api.get('/hr/background_checks').then(r => setChecks(r.data || [])).catch(() => setChecks([]));
  }

  function startCheck() {
    api.post('/hr/background/check', formCheck).then(r => {
      fetchChecks();
      setFormCheck({ application_id: '', type: 'basic' });
      alert('Background check initiated!');
    }).catch(e => alert('Error: ' + e.message));
  }

  function updateStatus(checkId, newStatus) {
    api.post('/hr/background/status', { check_id: checkId, status: newStatus })
      .then(r => {
        fetchChecks();
        alert('Status updated!');
      })
      .catch(e => alert('Error: ' + e.message));
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Background Verification</h2>
      <div style={{ marginBottom: 20, border: '1px solid #ccc', padding: 15 }}>
        <h3>Initiate Background Check</h3>
        <input
          placeholder="Application ID"
          type="number"
          value={formCheck.application_id}
          onChange={e => setFormCheck({ ...formCheck, application_id: e.target.value })}
          style={{ marginBottom: 10, display: 'block', width: '100%' }}
        />
        <select
          value={formCheck.type}
          onChange={e => setFormCheck({ ...formCheck, type: e.target.value })}
          style={{ marginBottom: 10, display: 'block', width: '100%' }}
        >
          <option value="basic">Basic</option>
          <option value="standard">Standard</option>
          <option value="comprehensive">Comprehensive</option>
        </select>
        <button onClick={startCheck} style={{ backgroundColor: 'var(--pp-success)', color: 'var(--pp-white)', padding: '10px 20px' }}>
          Start Check
        </button>
      </div>

      <h3>Background Checks</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ddd' }}>
            <th style={{ padding: 10, textAlign: 'left' }}>ID</th>
            <th style={{ padding: 10, textAlign: 'left' }}>Application</th>
            <th style={{ padding: 10, textAlign: 'left' }}>Type</th>
            <th style={{ padding: 10, textAlign: 'left' }}>Status</th>
            <th style={{ padding: 10, textAlign: 'left' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {checks.map(c => (
            <tr key={c.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: 10 }}>{c.id}</td>
              <td style={{ padding: 10 }}>{c.application_id}</td>
              <td style={{ padding: 10 }}>{c.type}</td>
              <td style={{ padding: 10 }}>
                <span style={{ 
                  padding: '5px 10px', 
                  borderRadius: 4,
                  backgroundColor: c.status === 'passed' ? 'var(--pp-success)' : c.status === 'failed' ? 'var(--pp-error)' : 'var(--pp-accent)',
                  color: 'white'
                }}>
                  {c.status}
                </span>
              </td>
              <td style={{ padding: 10 }}>
                <select onChange={e => updateStatus(c.id, e.target.value)} style={{ padding: 5 }}>
                  <option value="">Update Status...</option>
                  <option value="in_progress">In Progress</option>
                  <option value="passed">Passed</option>
                  <option value="failed">Failed</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
