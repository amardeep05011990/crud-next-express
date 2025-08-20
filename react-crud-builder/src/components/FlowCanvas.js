// src/FlowCanvas.js
import React, { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import Sidebar from './Sidebar';
import CollectionNode from './CollectionNode';
import { v4 as uuidv4 } from 'uuid';
import { saveAs } from 'file-saver';
import { saveSchemaToLocalStorage, loadSchemaFromLocalStorage } from './utils/schemaStorage';


const nodeTypes = {
  collection: CollectionNode,
};

const FlowCanvas = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [showRelationDialog, setShowRelationDialog] = useState(false);
const [selectedEdge, setSelectedEdge] = useState(null);
const [relationType, setRelationType] = useState("one-to-one");
const [fromField, setFromField] = useState("");
const [toField, setToField] = useState("");


useEffect(() => {
  const savedSchema = loadSchemaFromLocalStorage();
  if (savedSchema) {
    const { collections, relations } = savedSchema;

    const loadedNodes = collections.map((col, i) => ({
      id: col.id,
      type: 'collection',
      position: { x: 100 + i * 200, y: 100 + i * 50 }, // simple layout
      data: {
        name: col.name,
        label: col.name,
        fields: col.fields || [],
      },
    }));

    const loadedEdges = relations.map((rel) => ({
      id: `e-${rel.from}-${rel.to}`,
      source: rel.from,
      target: rel.to,
      label: rel.label || '',
      animated: true,
      style: { stroke: '#2196f3' },
      data: {
        relationType: rel.relationType,
        from: rel.fromField,
        to: rel.toField,
      },
    }));

    setNodes(loadedNodes);
    setEdges(loadedEdges);
  }
}, []);


  const onConnect = useCallback((params) => {
    const newEdge = {
      ...params,
      id: `e-${params.source}-${params.target}-${Date.now()}`,
      type: 'default',
      animated: true,
      label: 'Set Relation',
      data: {
        sourceField: '',
        targetField: '',
        relationType: '',
      },
      style: { stroke: '#2196f3' },
    };
    setEdges((eds) => addEdge(newEdge, eds));
  }, []);

//   const onEdgeClick = (_, edge) => {
//     const relation = prompt('Enter relation (e.g., userId => _id):', edge.label || '');
//     if (relation) {
//       setEdges((eds) =>
//         eds.map((e) => (e.id === edge.id ? { ...e, label: relation } : e))
//       );
//     }
//   };

const onEdgeClick=(event, edge) => {
    setSelectedEdge(edge);
    setRelationType(edge.data?.relationType || "one-to-one");
    setFromField(edge.data?.from || "");
    setToField(edge.data?.to || "");
    setShowRelationDialog(true);
  }

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    if (!type) return;

    const reactFlowBounds = event.currentTarget.getBoundingClientRect();
    const position = {
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    };

    const newNode = {
      id: uuidv4(),
      type,
      position,
      data: { label: `Collection ${nodes.length + 1}` },
    };

    setNodes((nds) => nds.concat(newNode));
  }, [nodes.length, setNodes]);

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };


const generateBackend = (nodes, edges) => {
//   const collections = nodes.map((node) => ({
//     name: node.data.label.replace(/\s+/g, ''),
//     id: node.id,
//   }));

const collections = nodes.map((node) => ({
    id: node.id,
    name: node.data?.name,
    fields: node.data?.fields || [],
  }));
  

  const relations = edges.map((edge) => {
    console.log("edge", edge)

    return ({
        relationType: edge.data?.relationType || '',
        from: edge.source,
        to: edge.target,
        label: edge.label || '',
        fromField: edge.data?.from,
        toField: edge.data?.to,
      });
  });

  const output = {
    collections,
    relations,
  };

  
  // Save to localStorage
  saveSchemaToLocalStorage(output);

  console.log("output", output)
  const blob = new Blob([JSON.stringify(output, null, 2)], {
    type: 'application/json',
  });

  saveAs(blob, 'schema.json');
};

const handleUploadSchema = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const text = event.target.result;
    try {
      const parsed = JSON.parse(text);
      saveSchemaToLocalStorage(parsed); // Optional: persist again
      const { collections, relations } = parsed;

      const uploadedNodes = collections.map((col, i) => ({
        id: col.id,
        type: 'collection',
        position: { x: 100 + i * 200, y: 100 + i * 50 },
        data: {
          name: col.name,
          label: col.name,
          fields: col.fields || [],
        },
      }));

      const uploadedEdges = relations.map((rel) => ({
        id: `e-${rel.from}-${rel.to}-${Date.now()}`,
        source: rel.from,
        target: rel.to,
        label: rel.label || '',
        animated: true,
        style: { stroke: '#2196f3' },
        data: {
          relationType: rel.relationType,
          from: rel.fromField,
          to: rel.toField,
        },
      }));

      setNodes(uploadedNodes);
      setEdges(uploadedEdges);
    } catch (err) {
      alert('Invalid JSON file!');
    }
  };
  reader.readAsText(file);
};



  return (
    
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar onDragStart={onDragStart} />
      <input type="file" accept="application/json" onChange={handleUploadSchema} />

      <button onClick={() => generateBackend(nodes, edges)}>💾 Generate Backend</button>

      <div style={{ flexGrow: 1 }} onDrop={onDrop} onDragOver={onDragOver}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onConnect={onConnect}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onEdgeClick={onEdgeClick}
          nodeTypes={nodeTypes}
          fitView
        >
          <MiniMap />
          <Controls />
          <Background gap={16} />
        </ReactFlow>
        {/* {showRelationDialog && (
  <div style={{ position: "absolute", top: 50, left: 50, background: "#fff", padding: 20, border: "1px solid #ccc", zIndex: 999 }}>
    <h3>Set Relation</h3>

    <label>Relation Type:</label>
    <select value={relationType} onChange={(e) => setRelationType(e.target.value)}>
      <option value="one-to-one">One-to-One</option>
      <option value="one-to-many">One-to-Many</option>
      <option value="many-to-one">Many-to-One</option>
      <option value="many-to-many">Many-to-Many</option>
    </select>

    <br />
    <label>From Field:</label>
    <input value={fromField} onChange={(e) => setFromField(e.target.value)} />

    <br />
    <label>To Field:</label>
    <input value={toField} onChange={(e) => setToField(e.target.value)} />
    

    <br />
    <button onClick={() => {
      setEdges((eds) => eds.map((e) =>
        e.id === selectedEdge.id
          ? {
              ...e,
              label: `${fromField} → ${toField} (${relationType})`,
              data: { relationType, from: fromField, to: toField },
            }
          : e
      ));
      setShowRelationDialog(false);
    }}>✅ Save</button>

    <button onClick={() => setShowRelationDialog(false)}>❌ Cancel</button>
  </div>
)} */}

{showRelationDialog && (
  <div style={{ position: "absolute", top: 50, left: 50, background: "#fff", padding: 20, border: "1px solid #ccc", zIndex: 999 }}>
    <h3>Set Relation</h3>

    <label>Relation Type:</label>
    <select value={relationType} onChange={(e) => setRelationType(e.target.value)}>
      <option value="one-to-one">One-to-One</option>
      <option value="one-to-many">One-to-Many</option>
      <option value="many-to-one">Many-to-One</option>
      <option value="many-to-many">Many-to-Many</option>
    </select>

    <br />
    <label>From Field:</label>
    <select value={fromField} onChange={(e) => setFromField(e.target.value)}>
      <option value="">Select</option>
      {(nodes.find(n => n.id === selectedEdge?.source)?.data?.fields || []).map((field, i) => (
        <option key={i} value={field.name}>{field.name}</option>
      ))}
    </select>

    <br />
    <label>To Field:</label>
    <select value={toField} onChange={(e) => setToField(e.target.value)}>
      <option value="">Select</option>
      {(nodes.find(n => n.id === selectedEdge?.target)?.data?.fields || []).map((field, i) => (
        <option key={i} value={field.name}>{field.name}</option>
      ))}
    </select>

    <br />
    <button onClick={() => {
      setEdges((eds) => eds.map((e) =>
        e.id === selectedEdge.id
          ? {
              ...e,
              label: `${fromField} → ${toField} (${relationType})`,
              data: { relationType, from: fromField, to: toField },
            }
          : e
      ));
      setShowRelationDialog(false);
    }}>✅ Save</button>

    <button onClick={() => setShowRelationDialog(false)}>❌ Cancel</button>
  </div>
)}


      </div>
    </div>
  );
};

export default FlowCanvas;
