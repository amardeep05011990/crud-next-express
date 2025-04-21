// src/CollectionNode.jsx
import React, { useState } from 'react';
import { Handle } from 'reactflow';

const CollectionNode = ({ data, id }) => {
  const [fields, setFields] = useState(data.fields || []);
  const [newField, setNewField] = useState({ name: '', type: 'string' });

  const addField = () => {
    if (newField.name.trim() !== '') {
      const updated = [...fields, newField];
      setFields(updated);
      data.fields = updated; // 🔐 persist to node data
      setNewField({ name: '', type: 'string' });
    }
  };

  return (
    <div style={{ padding: 10, border: '1px solid #999', background: '#fff', borderRadius: 4 }}>
      <strong>{data.label}</strong>
      <ul style={{ paddingLeft: 10 }}>
        {fields.map((f, i) => (
          <li key={i}>{f.name}: <em>{f.type}</em></li>
        ))}
      </ul>
      <input
        placeholder="Field name"
        value={newField.name}
        onChange={(e) => setNewField({ ...newField, name: e.target.value })}
        style={{ width: '100%', marginTop: 4 }}
      />
      <select
        value={newField.type}
        onChange={(e) => setNewField({ ...newField, type: e.target.value })}
        style={{ width: '100%', marginTop: 4 }}
      >
        <option value="string">String</option>
        <option value="number">Number</option>
        <option value="boolean">Boolean</option>
        <option value="date">Date</option>
      </select>
      <button onClick={addField} style={{ marginTop: 6, width: '100%' }}>Add Field</button>

      <Handle type="target" position="top" />
      <Handle type="source" position="bottom" />
    </div>
  );
};

export default CollectionNode;
