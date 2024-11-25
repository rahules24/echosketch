//libraries
import { connectionStrategies, dia, shapes, util } from '@joint/core';
import { useLayoutEffect, useRef, useEffect } from 'react';
import rough from 'roughjs';
import svgPanZoom from 'svg-pan-zoom';

// components
import Header from './Header';
import Controls from './stylePaletteComponents/Controls';

//utilities
import AOPelements from './utils/Elements';
import exportAsPNGorJPEG from './utils/ExportImage';
import { RoughLink, UpdateLinkEndpoints } from './utils/Links';
import { exportGraphAsJSON, importGraphFromJSON } from './utils/SaveGraph';
import CommandManager from './utils/CommandManger.js';
import applyDirectedLayout from './layout/directed';
import PaperEvents from './utils/PaperEvents';

const Paper = () => {

  /**paper and papermodel ref */
  const paperRef = useRef(null);
  const paperSmallRef = useRef(null);
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

  const updateSmallPaperSize = () => {
    if (paperSmallRef.current) {
      const smallPaperElement = paperSmallRef.current;
      
      const width = window.innerWidth * 0.25; 
      const height = window.innerHeight * 0.25;
      const left = window.innerWidth - width - 20; 
      const top = 20;

      smallPaperElement.style.width = `${width}px`;
      smallPaperElement.style.height = `${height}px`;
      smallPaperElement.style.left = `${left}px`;
      smallPaperElement.style.top = `${top}px`;
    }
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
          attrs: {
              line: {
                  'stroke-dasharray': selectedToolRef.current === 'dashedLink' ? '8' : '0',
              }
          }
      });
      },
      validateMagnet: function (_view, magnet) {
        panZoomInstance.disablePan();
        return magnet.getAttribute('magnet') === 'on-shift' && (selectedToolRef.current==='dashedLink' || selectedToolRef.current==='solidLink'); //makes sure there are no links from nothing
      }
    });

    const paperSmall = new dia.Paper({
      el: paperSmallRef.current,
      model: graph,
      gridSize: 1,
      interactive: false,
      cellViewNamespace: customNamespace,
    });

    /*  making paper rough */
    const Rough = rough.svg(paper.svg);
    const RoughSmall = rough.svg(paperSmall.svg);
    const borderEl = Rough.rectangle(0, 0,
                          window.innerWidth,
                          window.innerHeight,
                        {
                          stroke: 'transparent',
                      });
    paper.svg.appendChild(borderEl);
    paper.rough = Rough;
    paperSmall.rough = RoughSmall;

    /*  Integrating svg-pan-zoom with paper   */
    const panZoomInstance = svgPanZoom(Rough.svg, {
      dblClickZoomEnabled: false,
      minZoom: 0.1,
      maxZoom: 5,
      onUpdatedCTM: function(matrix) {
        const scaleFactor = 0.25;
        const { a, d, e, f } = matrix;
        const { a: ca, d: cd, e: ce, f: cf } = panZoomInstance.getZoom();
        const translateChanged = e !== ce || f !== cf;
        if (translateChanged) {
          paper.trigger('translate', e - ce, f - cf);
          paperSmall.translate(e * scaleFactor, f * scaleFactor);
        }
        const scaleChanged = a !== ca || d !== cd;
        if (scaleChanged) {
          paper.trigger('scale', a, d, e, f);
          paperSmall.scale(a * scaleFactor, d * scaleFactor);
        }
      }
    });

    panZoomRef.current = panZoomInstance;

    /** paper ref */
    paperGraph.current = paper;

    const commandManager = new CommandManager({
      stackLimit:100,
      graph:graph,
    });
    
    commandRef.current = commandManager;

    /** Function to make paper responsive */
    updateSmallPaperSize();
    function scaleContentToFit() {
    paper.transformToFitContent({padding: 20, minScaleX: 0.3, minScaleY: 0.3, maxScaleX: 1 , maxScaleY: 1});
    paperSmall.transformToFitContent({padding: 20, minScaleX: 0.075, minScaleY: 0.075, maxScaleX: 0.25 , maxScaleY: 0.25});
    }

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
      removeAllTools
    );

    /**RESPONSIVE PAPER EVENTS*/
    window.addEventListener('resize', util.debounce(scaleContentToFit), false);
    scaleContentToFit();
    window.addEventListener('resize', updateSmallPaperSize);

  
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
      }}
    >

      <div
        ref={paperRef}
        style={{
          width: 'auto',
          height: 'auto',
          background: "#FFFFFF",
          overflow:'auto'
        }}
      />

      <div
        ref={paperSmallRef}
        id="paper-small" // Add ID here to apply custom CSS
        style={{
          zIndex: 10000,
          background: '#FFF',
          // left: window.innerWidth - 320,
          // top: 20,
          border: '1px solid #000',
        }}
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
          if (type === "layout"){
            applyDirectedLayout(graphRef.current);
          }
        }}
        // File selection initiate this
        fileSelectionEvent={(event) =>{
          importGraphFromJSON(paperGraph,event)
        }}
      />

      <div
        ref={textEditorRef}
        className="text-editor"
        contentEditable="true"
      />

      <Controls panZoom= {panZoomRef}/>
      
    </div>

  );
}

export default Paper;