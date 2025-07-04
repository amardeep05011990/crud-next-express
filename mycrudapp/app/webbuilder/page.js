"use client"
import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

export default function Home() {
  const [components, setComponents] = useState([]);

  const addComponent = (type) => {
    setComponents([...components, { type, id: Date.now() }]);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-4">
        <button onClick={() => addComponent('text')} className="bg-blue-500 text-white px-4 py-2">Add Text</button>
        <button onClick={() => addComponent('image')} className="bg-green-500 text-white px-4 py-2 ml-2">Add Image</button>
        <div className="mt-4 border p-4">
          {components.map
            ((c) => (
            <div key={c.id} className="p-2 border mb-2">{c.type.toUpperCase()}</div>
          ))}
        </div>
      </div>
    </DndProvider>
  );
}
