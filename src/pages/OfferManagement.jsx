import React, { useState, useEffect } from 'react';
import api from '../api';

export default function OfferManagement() {
  const [offers, setOffers] = useState([]);
  const [formOffer, setFormOffer] = useState({ application_id: '', salary: '', currency: 'USD', terms: '' });

  useEffect(() => { fetchOffers(); }, []);

  function fetchOffers() {
    api.get('/hr/offers').then(r => setOffers(r.data || [])).catch(() => setOffers([]));
  }

  function submitOffer() {
    api.post('/hr/offer/generate', formOffer).then(r => {
      fetchOffers();
      setFormOffer({ application_id: '', salary: '', currency: 'USD', terms: '' });
      alert('Offer created successfully!');
    }).catch(e => alert('Error: ' + e.message));
  }

  function requestSignature(offerId) {
    api.post('/hr/offer/sign', { offer_id: offerId, candidate_email: 'candidate@example.com' })
      .then(r => alert(r.data.message))
      .catch(e => alert('Error: ' + e.message));
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Offer Management</h2>
      <div style={{ marginBottom: 20, border: '1px solid #ccc', padding: 15 }}>
        <h3>Create New Offer</h3>
        <input
          placeholder="Application ID"
          type="number"
          value={formOffer.application_id}
          onChange={e => setFormOffer({ ...formOffer, application_id: e.target.value })}
          style={{ marginBottom: 10, display: 'block', width: '100%' }}
        />
        <input
          placeholder="Salary"
          type="number"
          value={formOffer.salary}
          onChange={e => setFormOffer({ ...formOffer, salary: e.target.value })}
          style={{ marginBottom: 10, display: 'block', width: '100%' }}
        />
        <select
          value={formOffer.currency}
          onChange={e => setFormOffer({ ...formOffer, currency: e.target.value })}
          style={{ marginBottom: 10, display: 'block', width: '100%' }}
        >
          <option>USD</option>
          <option>EUR</option>
          <option>GBP</option>
          <option>KES</option>
        </select>
        <textarea
          placeholder="Terms (contract type, benefits, etc.)"
          value={formOffer.terms}
          onChange={e => setFormOffer({ ...formOffer, terms: e.target.value })}
          style={{ marginBottom: 10, display: 'block', width: '100%', height: 80 }}
        />
        <button onClick={submitOffer} style={{ backgroundColor: '#4CAF50', color: 'white', padding: '10px 20px' }}>
          Create Offer
        </button>
      </div>

      <h3>Active Offers</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ddd' }}>
            <th style={{ padding: 10, textAlign: 'left' }}>ID</th>
            <th style={{ padding: 10, textAlign: 'left' }}>Application</th>
            <th style={{ padding: 10, textAlign: 'left' }}>Salary</th>
            <th style={{ padding: 10, textAlign: 'left' }}>Status</th>
            <th style={{ padding: 10, textAlign: 'left' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {offers.map(o => (
            <tr key={o.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: 10 }}>{o.id}</td>
              <td style={{ padding: 10 }}>{o.application_id}</td>
              <td style={{ padding: 10 }}>{o.salary} {o.currency}</td>
              <td style={{ padding: 10 }}>Active</td>
              <td style={{ padding: 10 }}>
                <button onClick={() => requestSignature(o.id)} style={{ padding: '5px 10px', marginRight: 5 }}>Request Signature</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
