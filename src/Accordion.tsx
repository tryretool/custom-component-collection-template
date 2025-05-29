import React from 'react';
import { type FC } from 'react';
import { Retool } from '@tryretool/custom-component-support';

interface AccordionItem {
  title: string;
  content: string;
}

interface AccordionConfig {
  options: AccordionItem[];
  backgroundColor: string;
  textColor: string;
  roundedCorners: boolean;
  layout: string;
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

  if (!config.options || config.options.length === 0) {
    return <div>No accordion options provided.</div>;
  }

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      {config.options.map((item: AccordionItem, index: number) => (
        <div key={index} style={{ marginBottom: '10px' }}>
          <div
            onClick={() => toggle(index)}
            style={{
              padding: '10px',
              backgroundColor: config.backgroundColor,
              color: config.textColor,
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

export const getAccordionRetoolProps = () => {
  return { openIndex: Retool.getState('openIndex').value };
}; 