import React, { useEffect, useState } from 'react';
import api from '../api';

export default function Internship() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/recruitment/internships');
        setItems(res.data);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  return (
    <div>
      <h2>Internships</h2>
      <ul>
        {items.map(i => (
          <li key={i.id}>{i.candidate_name} ({i.status})</li>
        ))}
      </ul>
    </div>
  );
}
