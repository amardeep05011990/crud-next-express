// src/FlowCanvas.jsx
import ReactFlow, {
    ReactFlowProvider,
    addEdge,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
  } from 'reactflow';
  import 'reactflow/dist/style.css';
  import { useCallback } from 'react';
  import { v4 as uuidv4 } from 'uuid';
  import CollectionNode from './CollectionNode';
  import { useMemo } from 'react';
  
  const FlowCanvas = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
    const nodeTypes = useMemo(() => ({ default: CollectionNode }), []);
  
    const onConnect = useCallback((params) => {
        const newEdge = {
          ...params,
          id: `e${params.source}-${params.target}`,
          label: 'Click to set relation',
          data: {
            sourceField: '',
            targetField: '',
            relationType: '',
          },
          type: 'default',
        };
      
        setEdges((eds) => addEdge(newEdge, eds));
      }, []);
  
    const addNewCollection = () => {
      const id = uuidv4();
      const newNode = {
        id,
        type: 'default',
        data: { label: `Collection ${nodes.length + 1}` },
        position: { x: Math.random() * 300, y: Math.random() * 300 },
      };
      setNodes((nds) => [...nds, newNode]);
    };
  
    return (
      <div style={{ height: '100vh' }}>
        <button onClick={addNewCollection}>➕ Add Collection</button>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Background />
          <MiniMap />
          <Controls />
        </ReactFlow>
      </div>
    );
  };
  
  export default function FlowCanvasWrapper() {
    return (
      <ReactFlowProvider>
        <FlowCanvas />
      </ReactFlowProvider>
    );
  }
  