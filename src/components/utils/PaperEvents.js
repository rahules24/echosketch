import { dia, g, linkTools, highlighters } from '@joint/core';

import AddLabel from './AddLabel';
import AddDoubleClickTools from './AddTools';

const PaperEvents = (
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
  ) => {
    
    // Add this variable to store the current delete handler
    let currentDeleteHandler = null;

    // Function to set up the delete handler for a specific view
    const setupDeleteHandler = (view) => {
      // Remove previous handler if it exists
      if (currentDeleteHandler) {
        document.removeEventListener('keydown', currentDeleteHandler);
      }
      
      // Create and store new handler
      currentDeleteHandler = (event) => {
        if (event.key === "Delete" && view && view.model) {
          view.model.remove();
        }
      };
      
      // Add the new handler
      document.addEventListener('keydown', currentDeleteHandler);
    };

    const paperEvents = {

        /** LINK EVENTS */
        'link:mouseenter': function (linkView) {
          linkView.addTools(new dia.ToolsView({
            tools: [
              new linkTools.Vertices({ snapRadius: 0 }),
              new linkTools.TargetArrowhead(),
              new linkTools.Remove({
                distance: 20
              })
            ]
          }));
        },
        'link:mouseleave': function (linkView) {
          linkView.removeTools();
        },
        'link:pointerup': function(linkView) {
            const link = linkView.model;
            const source = link.getSourceElement();
            const target = link.getTargetElement();
            if (!source || !target || source === target) {
              link.remove();
            }
            selectedToolRef.current = '';
          },

        /** ELEMENT EVENTS */
        'element:pointerdown': function (elementView, evt) {
          idRef.current = evt.target.id;
          removeAllTools(paper, graph, true, true);
          elementRef.current = elementView.model;
          if (selectedToolRef.current ==='select') panZoomInstance.enablePan();
          textEditorRef.current.blur();
          highlighters.mask.add(elementView, 'body', elementView.model["id"], {
            layer: 'back',
            padding: 2,
            attrs: {
                'stroke-width': 2,
                'stroke': 'rgba(63, 0, 255)',
            },
          });
          
          // Use the new function instead of inline event listener
          setupDeleteHandler(elementView);
        },
        'element:pointerdblclick': function (elementView) {
          elementRef.current = null;
          removeAllTools(paper, graph, false, true);
          AddDoubleClickTools(elementView, textEditorRef);
          AddLabel(commandManager, elementView, textEditorRef);
        },
        
        /** PAPER EVENTS */
        'blank:pointerdown': function(evt, x, y) {
          removeAllTools(paper, graph, true, true);
          if (selectedToolRef.current ==='') panZoomInstance.disablePan();
          else if (selectedToolRef.current ==='select') panZoomInstance.enablePan();
          if (selectedToolRef.current !== 'dashedLink' && selectedToolRef.current !== 'solidLink') {
            graph.trigger('batch:stop');
            graph.trigger('batch:start');
          }
          if ((selectedToolRef.current === "MIE" || selectedToolRef.current === "KE" || selectedToolRef.current === "AO" || selectedToolRef.current === "AOP") && evt.button === 0){
            var data = evt.data = {};
            var cell;
            cell = AOPelements.create(selectedFontRef,
              selectedToolRef,
              strokeRef,
              fillRef,
              roughRef,
              borderRef,
              styleRef)
            cell.position(x, y);
            data.x = x;
            data.y = y;
            cell.addTo(this.model);
            data.cell = cell;
          }
          textEditorRef.current.blur();
        },
        'blank:pointermove': function(evt, x, y) {
          if (selectedToolRef.current !=="select" && selectedToolRef.current !== ''){
            panZoomInstance.disablePan()
            var data = evt.data;
            var cell = data.cell;
            var bbox = new g.Rect(data.x, data.y, x - data.x, y - data.y);
            bbox.normalize();
            if (cell){
            cell.set({
              position: { x: bbox.x, y: bbox.y },
              size: { width: Math.max(bbox.width, 1), height: Math.max(bbox.height, 1) }
            });
          }
        }
        },
        'blank:pointerup': function(evt) {
          graph.trigger('batch:stop');
          if (selectedToolRef.current === 'KE' || selectedToolRef.current === 'MIE' || selectedToolRef.current === 'AO' || selectedToolRef.current === 'AOP'){
            const data = evt.data;
            const cell = data.cell;
            if (cell) {
              const cellView = paper.findViewByModel(cell);
              if (cellView && idRef.current !== evt.target.id) {
                  highlighters.mask.add(cellView, 'body', cellView.model["id"], {
                  layer: 'back',
                  padding: 3,
                  attrs: {
                      'stroke-width': 2,
                      'stroke': 'rgba(63, 0, 255)',
                  },
                });
                elementRef.current = cellView.model;
                
                // Use the new function instead of inline event listener
                setupDeleteHandler(cellView);
              }
              const size = cell.size();
              if (size.width < 10 || size.height < 10) cell.remove();
            }
          }
          evt.handled = false;
          graph.getLinks().forEach(link => {
            const source = link.getSourceElement();
            const target = link.getTargetElement();
            if (!source || !target) {
              link.remove();
            }
          });
        },
    };

  return paperEvents;
}
export default PaperEvents