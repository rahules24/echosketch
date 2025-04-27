import { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { FaPalette } from "react-icons/fa";
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import Fill from './Fill';
import Roughness from './Roughness';
import Stroke from './Stroke';
import Border from './Border';
import Style from './Style';

function DesignPalette({
  onFillChange,
  onStrokeChange,
  onRoughChange,
  onBorderChange,
  onStyleChange,
}) {
  const paletteRef = useRef(null);
  const tippyInstance = useRef(null); // Reference to the Tippy instance
  const [prevStyle, setPrevStyle] = useState('solid');
  const [prevFill, setPrevFill] = useState('#ffffff');
  const [prevRough, setPrevRough] = useState(0.5);
  const [prevStroke, setPrevStroke] = useState('#E5E4E2');
  const [prevBorder, setPrevBorder] = useState('#000000');

  const components = [
    { component: Style, key: 'style', prop: onStyleChange, prevState: prevStyle, setPrevState: setPrevStyle },
    { component: Fill, key: 'fill', prop: onFillChange, prevState: prevFill, setPrevState: setPrevFill },
    { component: Roughness, key: 'roughness', prop: onRoughChange, prevState: prevRough, setPrevState: setPrevRough },
    { component: Stroke, key: 'stroke', prop: onStrokeChange, prevState: prevStroke, setPrevState: setPrevStroke },
    { component: Border, key: 'border', prop: onBorderChange, prevState: prevBorder, setPrevState: setPrevBorder },
  ];

  const createTippyContent = () => {
    return (
      <div>
        {components.map(({ component: Component, key, prop, prevState, setPrevState }) => (
          <div
            className='style-element'
            key={key}
            style={{ margin: '1px' }}
          >
            <Component onChange={prop} prevState={prevState} setPrevState={setPrevState} />
          </div>
        ))}
      </div>
    )};

  useEffect(() => {
    // Cleanup the Tippy instance if it exists
    if (tippyInstance.current) {
      tippyInstance.current.destroy();
      tippyInstance.current = null; // Clear the reference
    }

    if (paletteRef.current) {
      const tippyContentDiv = document.createElement('div');
      tippyContentDiv.classList.add('design-pallete');
      document.body.appendChild(tippyContentDiv);
      ReactDOM.createRoot(tippyContentDiv).render(createTippyContent());

      tippyInstance.current = tippy(paletteRef.current, {
        content: tippyContentDiv,
        // className: 'tippy-content',
        allowHTML: true,
        interactive: true,
        arrow: false,
        trigger: 'click',
        placement: 'top',
        theme: 'bgpalette',
        zIndex: 5000,
      });
    }

    return () => {
      // Cleanup Tippy instance on unmount
      if (tippyInstance.current) {
        tippyInstance.current.destroy();
        tippyInstance.current = null; // Clear the reference
      }
    };
  }, [prevStyle, prevFill, prevStroke, prevBorder]); // Include state variables in dependency array

  return (
    <div
    ref={paletteRef}
    >
      <FaPalette style={{ fontSize: '18px' }} />
    </div>
  );
}

export default DesignPalette;
