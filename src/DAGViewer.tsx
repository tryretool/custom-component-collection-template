import React from 'react';
import { type FC } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Node,
  Edge,
  Connection,
  addEdge
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Retool } from '@tryretool/custom-component-support';

export const DAGViewer: FC = () => {
  const [nodes] = Retool.useStateArray({
    name: 'nodes',
    initialValue: [],
    label: 'DAG Nodes'
  });

  const [edges] = Retool.useStateArray({
    name: 'edges',
    initialValue: [],
    label: 'DAG Edges'
  });

  const [config] = Retool.useStateObject({
    name: 'config',
    label: 'DAG Config',
    initialValue: {
      height: 600,
      backgroundColor: '#ffffff'
    }
  });

  // Support directional edge handles (optional per edge)
  const directionalEdges: Edge[] = edges.map(edge => {
    return {
      ...edge,
      sourceHandle: edge.sourceHandle || undefined,
      targetHandle: edge.targetHandle || undefined,
    };
  });

  return (
    <div style={{ height: config.height || 500, backgroundColor: config.backgroundColor, position: 'relative' }}>
      <ReactFlow
        nodes={nodes as Node[]}
        edges={directionalEdges as Edge[]}
        onConnect={(params: Connection) => {
          const newEdge: Edge = {
            ...params,
            id: `e-${params.source}-${params.target}`,
            sourceHandle: params.sourceHandle,
            targetHandle: params.targetHandle
          };
          Retool.getState('edges').setValue([...edges, newEdge]);
        }}
        fitView
      >
        <Background gap={16} color="#aaa" />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export const getDagViewerRetoolProps = () => {
  return {
    nodes: Retool.getState('nodes').value,
    edges: Retool.getState('edges').value,
    config: Retool.getState('config').value
  };
};
