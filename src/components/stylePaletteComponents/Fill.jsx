import { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GiLargePaintBrush } from "react-icons/gi";
import tippy from 'tippy.js';

const colors = [
  "#ffffff", "#ff0000", "#e91e63", "#9c27b0", "#673ab7", "#3f51b5", 
  "#2196f3", "#03a9f4", "#00bcd4", "#009688", "#4caf50", "#f5f542",
  "#00ff7f", "#ff00ff", "#ffc107", "#ff9800", "#ff5722", "#607d8b",
];

function Fill({ onChange, prevState, setPrevState }) {
  const fillRef = useRef(null);
  const tippyInstance = useRef(null);

  const handleColorSelect = (color) => {
    onChange(color);
    setPrevState(color);
    renderTippyContent();
  };

  const renderTippyContent = () => {
    const tippyContentDiv = document.createElement('div');
    tippyContentDiv.classList.add('element-pallete');
    document.body.appendChild(tippyContentDiv);

    createRoot(tippyContentDiv).render(
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '10px',
        width: '240px'
      }}>
        {colors.map((color) => (
          <div 
            key={color} 
            onClick={() => handleColorSelect(color)} 
            style={{
              backgroundColor: color,
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              cursor: 'pointer',
              transition: 'box-shadow 0.2s ease-in-out',
              boxShadow: prevState === color ? `0 0 10px 3px ${color === '#ffffff' ? '#cccccc' : color}` : 'none'
            }}
          />
        ))}
      </div>
    );

    if (tippyInstance.current) {
      tippyInstance.current.destroy();
    }

    tippyInstance.current = tippy(fillRef.current, {
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
    if (fillRef.current) {
      renderTippyContent();
    }
    return () => {
      if (tippyInstance.current) {
        tippyInstance.current.destroy();
      }
    };
  }, [fillRef, prevState]);

  return (
    <>
      <div ref={fillRef} style={{ margin: '3px' }}>
        <GiLargePaintBrush />
        <span style={{ marginLeft: '5px' }}>Fill-Color</span>
      </div>
    </>
  );
}

export default Fill;
