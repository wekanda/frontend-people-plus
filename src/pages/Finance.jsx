import React, { useEffect, useState } from 'react';
import api from '../api';

export default function Finance() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/finance/reports/payslips_summary');
        setSummary(res.data);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  const downloadCsv = async () => {
    try {
      const res = await api.get('/finance/reports/payslips_csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'payslips.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <h2>Finance</h2>
      {summary ? (
        <div>
          <div>Total payslips: {summary.count}</div>
          <div>Gross: {summary.gross}</div>
          <div>Tax: {summary.tax}</div>
          <div>Deductions: {summary.deductions}</div>
          <div>Net: {summary.net}</div>
          <button onClick={downloadCsv}>Download CSV</button>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}
