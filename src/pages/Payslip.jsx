import React, { useEffect, useState } from 'react';
import api from '../api';

export default function Payslip() {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/finance/payslips');
        setPayslips(res.data);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div>
      <h2>Payslips</h2>
      {loading && <div>Loading...</div>}
      <ul>
        {payslips.map(p => (
          <li key={p.id}>{p.period_start} - {p.period_end} : {p.net_pay}</li>
        ))}
      </ul>
    </div>
  );
}
