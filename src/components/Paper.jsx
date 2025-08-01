//libraries
import { connectionStrategies, dia, shapes } from '@joint/core';
import { useLayoutEffect, useRef, useEffect } from 'react';
import rough from 'roughjs';
import svgPanZoom from 'svg-pan-zoom';

// components
import Header from './Header';
import Controls from './stylePaletteComponents/Controls';
import SirenScripts from './stylePaletteComponents/SirenScripts.jsx';

//utilities
import AOPelements from './utils/Elements';
import exportAsPNGorJPEG from './utils/ExportImage';
import { RoughLink, UpdateLinkEndpoints } from './utils/Links';
import { exportGraphAsJSON, importGraphFromJSON } from './utils/SaveGraph';
import CommandManager from './utils/CommandManger.js';
// import applyDirectedLayout from './layout/directed';
import PaperEvents from './utils/PaperEvents';

const Paper = () => {

  /**paper and papermodel ref */
  const paperRef = useRef(null);
  const paperGraph = useRef(null);
  const commandRef = useRef(null);
  const graphRef = useRef(null);

  /**style refs */
  const strokeRef = useRef("#E5E4E2");
  const borderRef = useRef("#000000");
  const fillRef = useRef("#ffffff");
  const styleRef = useRef('solid');
  const roughRef = useRef([0.5]);
  const bgRef = useRef('#FFFFFF');
  const getLinkAttrs = () => ({
    line: {
      stroke: 'red',
      'stroke-dasharray': selectedToolRef.current === 'dashedLink' ? '15' : '0',
    }
  });  

  /** tool refs */
  const selectedToolRef = useRef('');
  const selectedFontRef = useRef('Arial');
  const textEditorRef = useRef(null);
  const panZoomRef = useRef(null);
  const elementRef = useRef(null);
  const idRef = useRef('');

  const handleExport = (format,bg) => {
    if (paperGraph.current) {
      removeAllTools(paperGraph.current, paperGraph.current.model, true, true);
      exportAsPNGorJPEG(paperGraph.current, format,bg);
    }
  };

  const handleSave = () => {
    if (paperGraph.current) {
      exportGraphAsJSON(paperGraph); /** Export of graph as json */
    }
  };

  const removeAllTools = (paper, graph, tools, highlight) => {
    const cells = graph.getElements();
    cells.forEach(cell => {
      const view = paper.findViewByModel(cell);
      if (view) {
        if (tools) view.removeTools();
        if (highlight) dia.HighlighterView.remove(view);

      }
    });
  };

  useLayoutEffect(() => {
  
    var customNamespace = {
      ...shapes,
      dia: dia,
      AOPelements, 
      RoughLink
    };

    /*  initializing the graph  */
    const graph = new dia.Graph({},{
      cellNamespace: customNamespace,
    });   

    /** Reference to the graph object */
    graphRef.current = graph;

    /*   Initializing the paper   */
      const paper = new dia.Paper({
      // el: document.getElementById('paper-multiple-papers'),
      el: paperRef.current,
      height: "100%", // Pass whole screen as svg area for drawing
      width: "100%",
      gridSize: 1,
      model: graph,
      cellViewNamespace: customNamespace,
      clickThreshold: 5,
      async: true,
      connectionStrategy: connectionStrategies.pinAbsolute,  //multiple links between same elements

      defaultLink: ()=> {
        return new RoughLink({ 
          // attrs: getLinkAttrs()
        });
      },

      validateMagnet: function (_view, magnet) {
        // Allow connections from both blank space and magnets when in link mode
        if (selectedToolRef.current === 'dashedLink' || selectedToolRef.current === 'solidLink') {
          // If magnet is null, we're starting from blank space, and that's allowed
          if (!magnet) return true;
          
          // If we have a magnet, check if it's a valid connection point
          return magnet.getAttribute('magnet') === 'on-shift';
        }
        
        // Not in link mode, don't allow connections
        return false;
      }
    });

    /*  making paper rough */
    const Rough = rough.svg(paper.svg);
    const borderEl = Rough.rectangle(0, 0,
                          window.innerWidth,
                          window.innerHeight,
                        {
                          stroke: 'transparent',
                      });
    paper.svg.appendChild(borderEl);
    paper.rough = Rough;

    /*  Integrating svg-pan-zoom with paper   */
    const panZoomInstance = svgPanZoom(Rough.svg, {
      dblClickZoomEnabled: false,
      minZoom: 0.1,
      maxZoom: 5,
      onUpdatedCTM: function(matrix) {
        const { a, d, e, f } = matrix;
        const { a: ca, d: cd, e: ce, f: cf } = panZoomInstance.getZoom();
        const translateChanged = e !== ce || f !== cf;
        if (translateChanged) {
          paper.trigger('translate', e - ce, f - cf);
        }
        const scaleChanged = a !== ca || d !== cd;
        if (scaleChanged) {
          paper.trigger('scale', a, d, e, f);
        }
      }
    });

    panZoomRef.current = panZoomInstance;
    panZoomInstance.disablePan();


    /** paper ref */
    paperGraph.current = paper;

    const commandManager = new CommandManager({
      stackLimit:100,
      graph:graph,
    });
    
    commandRef.current = commandManager;

    /** LOCAL STORAGE FUNCTIONS */
    const graphObj = JSON.parse(localStorage.getItem('renderGraph'));
    if (graphObj) {
      paperGraph.current.model.fromJSON(graphObj);
    }

    /** EVENT LISTENERS */

    const paperEvents = PaperEvents(
      paper,
      panZoomInstance,
      elementRef,
      idRef,
      textEditorRef, 
      selectedToolRef, 
      selectedFontRef, 
      strokeRef, 
      fillRef, 
      roughRef, 
      borderRef, 
      styleRef, 
      commandManager, 
      graph, 
      AOPelements,
      removeAllTools,
      getLinkAttrs,
    );

    /**RESPONSIVE PAPER EVENTS*/
    // window.addEventListener('resize', handPaperResize, false);
  
    /**KEYBOARD EVENTS */
    document.addEventListener('keydown', (event) => {
      if (event.key === "Escape") {
        if (textEditorRef.current) {
          textEditorRef.current.blur();
          }
          removeAllTools(paper, graph, true, true);
      }
      if (event.ctrlKey || event.metaKey) {
        if (event.key.toLowerCase() === 'z') {
          event.preventDefault();
          commandManager.undo();
        }
        if (event.key.toLowerCase() === 'y') {
          event.preventDefault();
          commandManager.redo();
        }
      }
    });

    /** GRAPH EVENTS */
    graph.on({
      'change:size': (element) => UpdateLinkEndpoints(element, graph)
    });
    
    /** PAPER EVENTS */
    paper.on(paperEvents);
    
    /**DRAGGING BY SCROLL-WHEEL */
    let isMiddleButtonPressed = false;
    let paperON = true;

    window.addEventListener("mousedown", (event) => {
      if (event.button === 1) {
        isMiddleButtonPressed = true;
        paper.off(paperEvents);
        paperON = false;
        panZoomInstance.enablePan();
      } else if (event.button === 0 && !paperON) {
        if (!isMiddleButtonPressed) {
          paper.on(paperEvents);
          paperON = true;
        }
      }
    });
    
    window.addEventListener("mouseup", (event) => {
      if (event.button === 1) {
        isMiddleButtonPressed = false;
        panZoomInstance.disablePan();
      }
      if (!paperON) {
        paperON = true;
        paper.on(paperEvents);
      }
    });
    
    window.addEventListener("mousemove", () => {
      if (isMiddleButtonPressed) {
        paper.off(paperEvents);
        panZoomInstance.enablePan();
        paperON = false;
      }
    });

  }, []);


  // Save data on beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (textEditorRef.current) {
        textEditorRef.current.blur();
      }

      const graphData = paperGraph.current.model.toJSON();
      localStorage.setItem('renderGraph', JSON.stringify(graphData));
    };

    // Register the beforeunload event listener
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        overflow: 'hidden',
        flexDirection: 'column', // Changed to column to stack elements vertically
      }}
    >
      
      <div
        ref={paperRef}
        style={{
          width: '100%',
          flex: 1, // Take up available space
          background: "#FFFFFF",
          overflow: 'auto'
        }}
      />

      <SirenScripts color={'#000'} />

      <div
        ref={textEditorRef}
        className="text-editor"
        contentEditable="true"
      />

      <Header
        elementRef={elementRef}
        onFont={(font) => {
          selectedFontRef.current = font;
        }}
        onStyle={(style) => {
          styleRef.current = style;
        }}
        onStroke={(stroke) => {
          strokeRef.current = stroke
          fillRef.current = '#ffffff';
        }}
        onBorder={(border) => {
          borderRef.current = border
        }}
        onBackground={(bg) => {
          bgRef.current = bg; //for exporting as image
          paperRef.current.style.backgroundColor = bg;
        }}
        onFill={(fill) => {
          fillRef.current = fill
          strokeRef.current = fill === '#ffffff' ? '#E5E4E2' : '#ffffff'
        }}
        onRough={(rough) => {
          roughRef.current = rough
        }}
        onSelect={(type) =>{ 
          selectedToolRef.current = type;
          if(type ==="save"){
            handleSave();
          }
          if (type === 'export') {
            handleExport('png', bgRef.current);
          }
          if (type === 'trash'){
            commandRef.current.reset();
            paperGraph.current.model.fromJSON({"cells": []});
            paperRef.current.style.backgroundColor = '#FFFEFF';
          }
          if (type === "undo"){
            if (commandRef.current.hasUndo()){
              commandRef.current.undo()
            }
          }
          if (type === "redo"){
            if (commandRef.current.hasRedo()){
              commandRef.current.redo()
            }
          }
          // if (type === "layout"){
          //   applyDirectedLayout(graphRef.current);
          // }
        }}
        // File selection initiate this
        fileSelectionEvent={(event) =>{
          importGraphFromJSON(paperGraph,event)
        }}
      />

      <Controls panZoom= {panZoomRef}/>

    </div>

  );
}

export default Paper;