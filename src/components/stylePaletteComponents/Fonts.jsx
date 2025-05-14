import React, { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { ImFont } from "react-icons/im";
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';  // Import tippy CSS

function Fonts({ onChange, prevState, setPrevState }) {

  const fontRef = useRef(null);
  const tippyInstance = useRef(null); // Create a ref to hold the tippy instance

  const handleFont = (font) => {
    if (onChange) onChange(font);
    setPrevState(font); // Set the selected font and trigger style update
    destroyTippy(); // Destroy the tippy instance when a font is selected
  };

  const fontOptions = [
    { fontFamily: 'Arial', id: 'arial', name: 'Arial' },
    { fontFamily: 'Virgil', id: 'virgil', name: 'Virgil' },
    { fontFamily: 'Cursive', id: 'cursive', name: 'Cursive' },
    { fontFamily: 'Courier', id: 'courier', name: 'Courier' },
    { fontFamily: 'Arial Black', id: 'arialBlack', name: 'Arial B.' },
    { fontFamily: 'Times New Roman', id: 'timesNewRoman', name: 'Times New R.' },
    { fontFamily: 'Lucida Handwriting', id: 'lucidaHandwriting', name: 'Lucida H.' },
  ];

  const selectedStyle = {
    fontWeight: 'bold',
    color: 'black',
    padding: '3px 6px',
    borderRadius: '6px',
    fontSize: '16px',
    backgroundColor: 'rgb(12, 25, 39, 0.09)',
    boxShadow: '0 4px 8px rgba(0,0,0, 0.4)',
  };

  const renderTippyContent = () => (
    <div>
      {fontOptions.map((font) => (
        <div
          className='font-item'
          key={font.id}
          id={font.id}
          onClick={() => handleFont(font.fontFamily)}
          style={{
            fontFamily: font.fontFamily,
            ...(font.fontFamily === prevState && selectedStyle)
        }}        
        >
          <span>{font.name}</span>
        </div>
      ))}
    </div>
  );

  const destroyTippy = () => {
    if (tippyInstance.current) {
      tippyInstance.current.destroy();
      tippyInstance.current = null;
    }
  };

  useEffect(() => {
    if (fontRef.current) {
      const tippyContentDiv = document.createElement('div');
      tippyContentDiv.classList.add('element-pallete');
      document.body.appendChild(tippyContentDiv);
      createRoot(tippyContentDiv).render(renderTippyContent());

      tippyInstance.current = tippy(fontRef.current, {
        content: tippyContentDiv,
        allowHTML: true,
        interactive: true,
        arrow: false,
        trigger: 'click',
        placement: 'top',
        theme: 'bgpalette',
        animation: 'fade',
        popperOptions: {
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, 26],
              },
            },
          ],
        },
        // cursor: 'pointer',
      });
    }

    // Cleanup function to destroy the tippy instance on unmount
    return () => {
      destroyTippy();
    };
  }, [fontRef, prevState]);

  return (
    <div ref={fontRef}>
      <ImFont style={{ fontSize: '18px' }} />
    </div>
  );
}

export default Fonts;
