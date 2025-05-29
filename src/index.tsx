// DAGEditor.tsx – interactive node creation via edge dragging and add button

// DAGEditor.tsx – node and edge rendering with directional handle config

// export

import React from 'react';
import { type FC } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Node,
  Edge,
  Connection,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Retool } from '@tryretool/custom-component-support';

// DAG Viewer Component
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

  return (
    <div style={{ height: config.height || 500, backgroundColor: config.backgroundColor, position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onConnect={(params: Connection) => {
          const newEdge = {
            ...params,
            id: `e-${params.source}-${params.target}`,
          };
          const currentEdges = Retool.getState('edges').value || [];
          Retool.getState('edges').setValue([...currentEdges, newEdge]);
        }}
        fitView
      >
        <Background gap={16} color="#aaa" />
        <Controls />
      </ReactFlow>
    </div>
  );
};

// Accordion Component
interface AccordionItem {
  title: string;
  content: string;
}

export const Accordion: FC = () => {
  const [config] = Retool.useStateObject({
    name: 'config',
    initialValue: {
      options: [],
      backgroundColor: '#f0f0f0',
      textColor: '#000',
      roundedCorners: true,
      layout: 'stacked',
    },
    label: 'Accordion Configuration'
  });

  const [openIndex, setOpenIndex] = Retool.useStateNumber({
    name: 'openIndex',
    initialValue: -1,
    label: 'Open Accordion Index',
    inspector: 'text',
    description: 'Tracks which accordion section is open'
  });

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  const options = config.options || [];
  
  if (options.length === 0) {
    return <div>No accordion options provided.</div>;
  }

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      {options.map((item: AccordionItem, index: number) => (
        <div key={index} style={{ marginBottom: '10px' }}>
          <div
            onClick={() => toggle(index)}
            style={{
              padding: '10px',
              backgroundColor: config.backgroundColor || '#f0f0f0',
              color: config.textColor || '#000',
              cursor: 'pointer',
              fontWeight: 'bold',
              border: '1px solid #ccc',
              borderRadius: config.roundedCorners ? '6px' : '0px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{item.title}</span>
            <span>{openIndex === index ? '▲' : '▼'}</span>
          </div>
          {openIndex === index && (
            <div
              style={{
                padding: '10px',
                border: '1px solid #ccc',
                borderTop: 'none',
                backgroundColor: '#fff',
              }}
            >
              {item.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// // Export Retool Props
// export const getRetoolProps = () => {
//   const component = Retool.getComponentName();
  
//   if (component === 'DAGViewer') {
//     return {
//       nodes: Retool.getState('nodes').value,
//       edges: Retool.getState('edges').value,
//       config: Retool.getState('config').value
//     };
//   }
  
//   if (component === 'Accordion') {
//     return {
//       openIndex: Retool.getState('openIndex').value,
//       config: Retool.getState('config').value
//     };
//   }
  
//   return {};
// };

