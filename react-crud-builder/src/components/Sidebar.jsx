// src/Sidebar.jsx
import React from 'react';

const Sidebar = ({ onDragStart }) => {
  return (
    <aside style={{ padding: 10, width: 150, background: '#f5f5f5', borderRight: '1px solid #ccc' }}>
      <p><strong>📦 Collections</strong></p>
      
      <div
        style={{ marginBottom: 10, padding: 5, background: '#ddd', cursor: 'grab' }}
        draggable
        onDragStart={(e) => onDragStart(e, 'collection')}
      >
        🧾 New Collection
      </div>
    </aside>
  );
};

export default Sidebar;
