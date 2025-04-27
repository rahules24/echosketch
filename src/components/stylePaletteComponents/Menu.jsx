import { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { FaBars, FaFolderOpen, FaSave } from "react-icons/fa";
import { MdImage } from "react-icons/md";
import { BiSolidFileJson } from "react-icons/bi";
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

function Menu({ onOptionClick }) {
  const burgerRef = useRef(null);
  const saveAsTriggerRef = useRef(null);
  const tippyInstance = useRef(null);
  const saveAsTippyInstance = useRef(null);

  const options = [
    { name: "Open", icon: <FaFolderOpen />, command: "open" },
    { name: "Save As", icon: <FaSave />, command: "saveAs" },
  ];

  const saveAsOptions = [
    { name: "Image", icon: <MdImage />, command: "export" },
    { name: "Graph", icon: <BiSolidFileJson />, command: "save" },
  ];

  const createMainTippyContent = () => {
    const tippyContentDiv = document.createElement('div');
    tippyContentDiv.classList.add('element-pallete');
    tippyContentDiv.style.marginBottom = '18px';
    createRoot(tippyContentDiv).render(
      <>
        {options.map((opt, index) => (
          <div
            className="style-element"
            key={index}
            ref={opt.command === 'saveAs' ? saveAsTriggerRef : null}
            onClick={() => {
              if (opt.command === 'saveAs') {
                // Show the Save As Tippy
                createSaveAsTippyContent();
              } else {
                onOptionClick(opt.command);
                tippyInstance.current.hide(); // Hide main Tippy for other options
              }
            }}
          >
            {opt.icon}
            <span style={{ marginLeft: '5px' }}>{opt.name}</span>
          </div>
        ))}
      </>
    );

    // if (tippyInstance.current) {
    //   tippyInstance.current.destroy();
    // }

    tippyInstance.current = tippy(burgerRef.current, {
      content: tippyContentDiv,
      allowHTML: true,
      interactive: true,
      arrow: false,
      trigger: 'click',
      placement: 'top',
      theme: 'bgpalette',
      zIndex: 5000,
    });
  };

  const createSaveAsTippyContent = () => {
    const saveAsDiv = document.createElement('div');
    saveAsDiv.classList.add('design-pallete');
    saveAsDiv.style.marginLeft = '5px';
    saveAsDiv.style.marginBottom = '0px';
    createRoot(saveAsDiv).render(
      <>
        {saveAsOptions.map((opt, index) => (
          <div
            className="style-element"
            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            key={index}
            onClick={() => {
              onOptionClick(opt.command);
              saveAsTippyInstance.current.hide(); // Close Save As Tippy after selection
            }}
          >
            <span style={{ fontSize: '18px' }}>{opt.icon}</span>
            <span style={{ marginLeft: '5px' }}>{opt.name}</span>
          </div>
        ))}
      </>
    );

    if (saveAsTippyInstance.current) {
      saveAsTippyInstance.current.destroy();
    }

    saveAsTippyInstance.current = tippy(saveAsTriggerRef.current, {
      content: saveAsDiv,
      allowHTML: true,
      interactive: true,
      arrow: false,
      trigger: 'click', // Trigger nested Tippy on click
      placement: 'right', // Place it to the right of the "Save As" option
      theme: 'bgpalette',
      zIndex: 5000,
    });

    saveAsTippyInstance.current.show(); // Show the nested Tippy
  };

  useEffect(() => {
    if (burgerRef.current) {
      createMainTippyContent(); // Initialize main Tippy on mount
    }

    return () => {
      if (tippyInstance.current) {
        tippyInstance.current.destroy();
      }
      if (saveAsTippyInstance.current) {
        saveAsTippyInstance.current.destroy();
      }
    };
  }, []);

  return (
    <div ref={burgerRef}>
      <FaBars style={{ fontSize: '18px' }} />
    </div>
  );
}

export default Menu;
