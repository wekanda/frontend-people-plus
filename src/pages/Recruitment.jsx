import React, { useEffect, useState } from 'react';
import api from '../api';

export default function Recruitment() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/recruitment/jobs');
        setJobs(res.data);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  return (
    <div>
      <h2>Recruitment</h2>
      <ul>
        {jobs.map(j => (
          <li key={j.id}>{j.title} - {j.location} ({j.status})</li>
        ))}
      </ul>
    </div>
  );
}
