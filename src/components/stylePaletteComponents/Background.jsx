import { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { RiPaintFill } from "react-icons/ri";
import tippy from 'tippy.js';

const colors = [
  '#FFFFFF', '#FFFFCC', '#FFF9C4', '#FFECB3', '#FFE0B2', '#FFCCBC', '#F8BBD0',
  '#E1BEE7', '#D1C4E9', '#C5CAE9', '#BBDEFB', '#B3E5FC', '#FFCCFF', '#CCFFCC'
];

function Background({ onChange, prevState, setPrevState }) {
  const backgroundPalletRef = useRef(null);
  const tippyInstance = useRef(null);

  const handleColorSelect = (color) => {
    onChange(color);
    setPrevState(color);
    destroyTippy(); // Destroy tippy once a color is selected
  };

  const renderTippyContent = () => {
    const tippyContentDiv = document.createElement('div');
    tippyContentDiv.classList.add('element-pallete');
    tippyContentDiv.style.marginBottom = '20px';
    document.body.appendChild(tippyContentDiv);

    createRoot(tippyContentDiv).render(
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', width: '260px' }}>
        {colors.map((color) => (
          <div
            key={color}
            onClick={() => handleColorSelect(color)}
            style={{
              backgroundColor: color,
              width: '30px',
              height: '30px',
              cursor: 'pointer',
              borderRadius: '5px',
              boxShadow: prevState === color ? '0 0 10px 3px rgba(0, 0, 0, 0.2)' : 'none'
            }}
          />
        ))}
      </div>
    );

    if (tippyInstance.current) {
      tippyInstance.current.destroy();
    }

    tippyInstance.current = tippy(backgroundPalletRef.current, {
      content: tippyContentDiv,
      allowHTML: true,
      interactive: true,
      arrow: false,
      trigger: 'click',
      placement: 'top',
      theme: 'elpalette',
    });
  };

  const destroyTippy = () => {
    if (tippyInstance.current) {
      tippyInstance.current.destroy();
      tippyInstance.current = null;
    }
  };

  useEffect(() => {
    if (backgroundPalletRef.current) {
      renderTippyContent();
    }
    return () => {
      destroyTippy(); // Cleanup on unmount
    };
  }, [backgroundPalletRef, prevState]);

  return (
    <div ref={backgroundPalletRef} style={{ margin: '3px' }}>
      <RiPaintFill style={{ fontSize: '18px' }} />
    </div>
  );
}

export default Background;
