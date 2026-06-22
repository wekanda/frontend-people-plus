import React, { useState, useEffect } from 'react';
import api from '../api';

export default function Assessments() {
  const [templates, setTemplates] = useState([]);
  const [formTemplate, setFormTemplate] = useState({ title: '', description: '', questions: [] });
  const [currentQ, setCurrentQ] = useState({ q: '', options: ['', '', ''], key: '' });

  useEffect(() => { fetchTemplates(); }, []);

  function fetchTemplates() {
    api.get('/assessments/templates').then(r => setTemplates(r.data.templates || [])).catch(() => setTemplates([]));
  }

  function addQuestion() {
    setFormTemplate({ ...formTemplate, questions: [...formTemplate.questions, currentQ] });
    setCurrentQ({ q: '', options: ['', '', ''], key: '' });
  }

  function submitTemplate() {
    api.post('/assessments/templates', formTemplate).then(r => {
      fetchTemplates();
      setFormTemplate({ title: '', description: '', questions: [] });
    }).catch(e => alert('Error creating template: ' + e.message));
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Assessment Templates</h2>
      <div style={{ marginBottom: 20, border: '1px solid #ccc', padding: 15 }}>
        <h3>Create Template</h3>
        <input
          placeholder="Template Title"
          value={formTemplate.title}
          onChange={e => setFormTemplate({ ...formTemplate, title: e.target.value })}
          style={{ marginBottom: 10, display: 'block', width: '100%' }}
        />
        <textarea
          placeholder="Description"
          value={formTemplate.description}
          onChange={e => setFormTemplate({ ...formTemplate, description: e.target.value })}
          style={{ marginBottom: 10, display: 'block', width: '100%', height: 60 }}
        />

        <h4>Add Questions</h4>
        <input
          placeholder="Question"
          value={currentQ.q}
          onChange={e => setCurrentQ({ ...currentQ, q: e.target.value })}
          style={{ marginBottom: 5, display: 'block', width: '100%' }}
        />
        <input
          placeholder="Option 1"
          value={currentQ.options[0]}
          onChange={e => { const opts = [...currentQ.options]; opts[0] = e.target.value; setCurrentQ({ ...currentQ, options: opts }); }}
          style={{ marginBottom: 5, display: 'block', width: '100%' }}
        />
        <input
          placeholder="Option 2"
          value={currentQ.options[1]}
          onChange={e => { const opts = [...currentQ.options]; opts[1] = e.target.value; setCurrentQ({ ...currentQ, options: opts }); }}
          style={{ marginBottom: 5, display: 'block', width: '100%' }}
        />
        <input
          placeholder="Option 3"
          value={currentQ.options[2]}
          onChange={e => { const opts = [...currentQ.options]; opts[2] = e.target.value; setCurrentQ({ ...currentQ, options: opts }); }}
          style={{ marginBottom: 5, display: 'block', width: '100%' }}
        />
        <input
          placeholder="Correct Answer"
          value={currentQ.key}
          onChange={e => setCurrentQ({ ...currentQ, key: e.target.value })}
          style={{ marginBottom: 5, display: 'block', width: '100%' }}
        />
        <button onClick={addQuestion} style={{ marginRight: 10 }}>Add Question</button>
        <span>{formTemplate.questions.length} questions</span>

        <div style={{ marginTop: 10 }}>
          <button onClick={submitTemplate} style={{ backgroundColor: '#4CAF50', color: 'white', padding: '10px 20px' }}>
            Create Template
          </button>
        </div>
      </div>

      <h3>Existing Templates</h3>
      <ul>
        {templates.map((t, idx) => (
          <li key={idx}>{t.title || 'Untitled'} — {t.description}</li>
        ))}
      </ul>
    </div>
  );
}
