import React, { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { TbChartGridDotsFilled } from "react-icons/tb";
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

import { FaSquare } from "react-icons/fa";
import { TbGridDots } from "react-icons/tb";
import { FaStairs, FaLinesLeaning } from "react-icons/fa6";
import { GiCrossMark, GiHeavyRain, GiPowerLightning } from "react-icons/gi";

const stylesMapping = [
  { label: 'Solid', icon: <FaSquare />, value: 'solid' },
  { label: 'Coarse', icon: <TbGridDots />, value: 'dots' },
  { label: 'ZigZag', icon: <GiPowerLightning />, value: 'zigzag' },
  { label: 'Hachure', icon: <FaLinesLeaning />, value: 'hachure' },
  { label: 'Treaded', icon: <FaStairs />, value: 'zigzag-line' },
  { label: 'Cross-Hatch', icon: <GiCrossMark />, value: 'cross-hatch' },
  { label: 'Meteor Shower', icon: <GiHeavyRain />, value: 'dashed' },
];

function Style({ onChange, prevState, setPrevState }) {
  
  const styleRef = useRef(null);
  const tippyInstance = useRef(null); // Create a ref to hold the tippy instance

  const handleStyle = (style) => {
    onChange(style);
    setPrevState(style);
    renderTippyContent();
  };

  const selectedStyle = {
    fontWeight: 'bold',
    color: 'black',
    padding: '3px 6px',
    borderRadius: '6px',
    fontSize: '16px',
    backgroundColor: 'rgb(12, 25, 39, 0.09)',
    boxShadow: '0 4px 8px rgba(0,0,0, 0.4)',
  };

  const renderTippyContent = () => {
    const tippyContentDiv = document.createElement('div');
    tippyContentDiv.classList.add('element-pallete'); // Add your CSS class here
    createRoot(tippyContentDiv).render(
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {stylesMapping.map((style) => (
          <li
            key={style.value}
            className={style.value === prevState ? '' : 'style-element'}
            style={{ cursor: 'pointer', padding: '3px 4px', margin: 1 }}
            onClick={() => handleStyle(style.value)}
          >
            <div style={style.value === prevState ? selectedStyle : {}}>
              {style.icon}
              <span style={{ marginLeft: '5px' }}>{style.label}</span>
            </div>
          </li>
        ))}
      </ul>
    );

    // If the tippy instance already exists, destroy it before creating a new one
    if (tippyInstance.current) {
      tippyInstance.current.destroy();
    }

    // Create a new tippy instance
    tippyInstance.current = tippy(styleRef.current, {
      content: tippyContentDiv,
      allowHTML: true,
      interactive: true,
      arrow: false,
      trigger: 'click',
      placement: 'right',
      theme: 'elpalette',
    });
  };

  useEffect(() => {
    if (styleRef.current) {
      renderTippyContent(); // Initial render of the tippy content
    }

    // Cleanup function to destroy the tippy instance on unmount
    return () => {
      if (tippyInstance.current) {
        tippyInstance.current.destroy();
      }
    };
  }, [styleRef, prevState]);

  return (
    <div
      ref={styleRef}
      style={{margin: '3px'}}
    >
      <TbChartGridDotsFilled />
      <span style={{ marginLeft: '5px' }}>Fill-Style</span>
    </div>
  );
}

export default Style;
