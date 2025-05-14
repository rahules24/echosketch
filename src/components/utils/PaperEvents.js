import { dia, g, linkTools, highlighters } from '@joint/core';

import AddLabel from './AddLabel';
import AddDoubleClickTools from './AddTools';
import { RoughLink } from './Links';

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
    getLinkAttrs,
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

    paper.currentLink = null;
    paper.linkCreationMode = false;
    paper.linkCreationBatch = false; // Add a flag to track if we're in a link creation batch
    
    // Init pan-zoom state
    if (selectedToolRef.current === 'dashedLink' || selectedToolRef.current === 'solidLink') {
      panZoomInstance.disablePan();
    } else if (selectedToolRef.current === 'select') {
      panZoomInstance.enablePan();
    } else {
      panZoomInstance.disablePan();
    }
    
    // Helper function to find element under point
    const findElementUnderPoint = (x, y) => {
      // Convert client coordinates to paper coordinates if needed
      const elementBelow = paper.findViewsFromPoint({ x, y })[0];
      return elementBelow && elementBelow.model.isElement() ? elementBelow : null;
    };

    function createLink(source, x, y) {
      return new RoughLink({
        source: source,
        target: { x, y }, // Initial target follows mouse
        // attrs: getLinkAttrs()
      });
    }

    // Function to update pan-zoom state based on the selected tool
    const updatePanZoomState = () => {
      if (selectedToolRef.current === 'select') {
        panZoomInstance.enablePan();
      } else {
        panZoomInstance.disablePan();
      }
    };
    
    // Force disable pan-zoom when in link creation mode
    const enforceToolState = () => {
      // Always disable pan when in link creation mode, regardless of any other state
      if (selectedToolRef.current === 'dashedLink' || selectedToolRef.current === 'solidLink') {
        panZoomInstance.disablePan();
      }
    };
    
    // Monitor changes to selectedToolRef and update pan-zoom state
    const previousToolRef = { current: selectedToolRef.current };
    const checkToolChange = () => {
      if (previousToolRef.current !== selectedToolRef.current) {
        previousToolRef.current = selectedToolRef.current;
        updatePanZoomState();
        enforceToolState();
      }
      requestAnimationFrame(checkToolChange);
    };
    checkToolChange();

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
        'link:pointerup': function() {
            selectedToolRef.current = '';
            updatePanZoomState();
        },

        /** ELEMENT EVENTS */
        'element:pointerdown': function (elementView, evt) {
          // First check if we're in link creation mode and forcibly disable panning
          if (selectedToolRef.current === 'dashedLink' || selectedToolRef.current === 'solidLink') {
            panZoomInstance.disablePan();
          }
          
          idRef.current = evt.target.id;
          removeAllTools(paper, graph, true, true);
          AddDoubleClickTools(elementView, textEditorRef);
          elementRef.current = elementView.model;
          highlighters.mask.add(elementView, 'body', elementView.model["id"], {
            layer: 'back',
            padding: 2,
            attrs: {
                'stroke-width': 3,
                'stroke': 'rgba(63, 0, 255)',
            },
          });
          if (selectedToolRef.current !== 'dashedLink' && selectedToolRef.current !== 'solidLink') {
            graph.trigger('batch:stop');
            graph.trigger('batch:start');
          }
          // Handle link creation when starting from an element
          if (selectedToolRef.current === 'dashedLink' || selectedToolRef.current === 'solidLink') {
            // Ensure pan is disabled when creating links
            panZoomInstance.disablePan();
            
            // Start batch operation for command manager
            graph.trigger('batch:start');
            paper.linkCreationBatch = true;
            
            // Get position of the element
            const elementPosition = elementView.model.position();
            const elementSize = elementView.model.size();
            const x = elementPosition.x + elementSize.width/2;
            const y = elementPosition.y + elementSize.height/2;
            
            const link = createLink({ id: elementView.model.id }, x, y);

            graph.addCell(link);
            paper.currentLink = link;
            paper.linkCreationMode = true;
            paper.currentLinkSource = 'element';
          }
          
          // Use the new function instead of inline event listener
          setupDeleteHandler(elementView);
          textEditorRef.current.blur();
        },
        'element:pointerup': function(elementView) {
          if (paper.currentLink) {
            // Snap the link's target to the clicked element
            paper.currentLink.set('target', { id: elementView.model.id });
            
            // End batch operation for command manager
            if (paper.linkCreationBatch) {
              graph.trigger('batch:stop');
              paper.linkCreationBatch = false;
            }
            
            paper.currentLink = null; // Clear current link
            paper.linkCreationMode = false;
            paper.currentLinkSource = null;
            selectedToolRef.current = ''; 
            // Restore pan state based on new tool selection
            updatePanZoomState();
          }
        },
        'element:pointerdblclick': function (elementView) {
          // First completely remove all tools
          elementView.removeTools();
          paper.hideTools();
          
          // Then forcibly remove all tools again to be sure
          removeAllTools(paper, graph, true, true);
          
          elementRef.current = null;
          
          // Add the label editor after ensuring tools are gone
          setTimeout(() => {
            AddLabel(commandManager, elementView, textEditorRef);
          }, 0);
        },
        
        /** PAPER EVENTS */
        'blank:pointerdown': function(evt, x, y) {
          removeAllTools(paper, graph, true, true);
          
          // Always ensure pan-zoom is disabled when we're in link creation mode
          if (selectedToolRef.current === 'dashedLink' || selectedToolRef.current === 'solidLink') {
            panZoomInstance.disablePan();
          }
          
          if (selectedToolRef.current !== 'dashedLink' && selectedToolRef.current !== 'solidLink') {
            graph.trigger('batch:stop');
            graph.trigger('batch:start');
          }
          
          if (selectedToolRef.current === 'dashedLink' || selectedToolRef.current === 'solidLink') {
            // Make sure panning is disabled when creating links
            panZoomInstance.disablePan();
            
            // Start batch operation for command manager
            graph.trigger('batch:start');
            paper.linkCreationBatch = true;
            
            const link = createLink({ x, y }, x, y);

            graph.addCell(link);
        
            // Store the link reference for drag updates
            paper.currentLink = link;
            paper.linkCreationMode = true;
            paper.currentLinkSource = 'blank';
            
            // Save the starting point coordinates
            paper.linkStartPoint = { x, y };
          }
          if ((selectedToolRef.current === "MIE" || selectedToolRef.current === "KE" || selectedToolRef.current === "AO" || selectedToolRef.current === "AOP") && evt.button === 0){
            // Make sure panning is disabled when creating elements
            panZoomInstance.disablePan();
            
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
        'mousemove': function(evt, x, y) {
          if (paper.currentLink && paper.linkCreationMode) { 
            // Check if there's an element under the cursor
            const elementBelow = findElementUnderPoint(x, y);
            
            // Update link endpoint to either snap to element or follow cursor
            if (elementBelow) {
              // Snap to the element
              paper.currentLink.set('target', { id: elementBelow.model.id });
            } else {
              // Follow the cursor
              paper.currentLink.set('target', { x, y });
            }
          }
        },
        'blank:pointermove': function(evt, x, y) {
          // Always ensure pan-zoom is disabled when in link creation mode, no matter what
          if (paper.currentLink && paper.linkCreationMode) {
            panZoomInstance.disablePan();
          }
          
          if (selectedToolRef.current !=="select" && selectedToolRef.current !== ''){
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
          
          // Handle link movement regardless of whether another tool is active
          if (paper.currentLink && paper.linkCreationMode) {
            // Ensure pan is disabled when creating links
            panZoomInstance.disablePan();
            
            // Check if there's an element under the cursor
            const elementBelow = findElementUnderPoint(x, y);
            
            // Update link endpoint to either snap to element or follow cursor
            if (elementBelow) {
              // Highlight the element to show it can be connected
              highlighters.mask.add(elementBelow, 'body', 'highlight-connect', {
                layer: 'back',
                padding: 0,
                attrs: {
                  'stroke-width': 3,
                  'stroke': 'rgba(255, 166, 0, 0.72)',
                },
              });
              
              // Snap to the element
              paper.currentLink.set('target', { id: elementBelow.model.id });
              
              // Remember the last element we were hovering over
              paper.lastHoveredElement = elementBelow;
            } else {
              // Remove highlight from the last element if we're no longer over it
              if (paper.lastHoveredElement) {
                highlighters.mask.remove(paper.lastHoveredElement, 'highlight-connect');
                paper.lastHoveredElement = null;
              }
              
              // Follow the cursor
              paper.currentLink.set('target', { x, y });
            }
          }
        },
        'blank:pointerup': function(evt, x, y) {
          // Only stop batch if we're not in link creation mode
          if (!paper.linkCreationMode) {
            graph.trigger('batch:stop');
          }
          
          if (paper.currentLink && paper.linkCreationMode) {
            // Check if the link is connected to an element
            const targetIsElement = typeof paper.currentLink.get('target') === 'object' && 
                                   paper.currentLink.get('target').id;
            
            // If not connected to an element and too short, remove it
            if (!targetIsElement && paper.linkStartPoint) {
              const dx = x - paper.linkStartPoint.x;
              const dy = y - paper.linkStartPoint.y;
              const distance = Math.sqrt(dx*dx + dy*dy);
              
              // Remove only if the distance is too small
              if (distance < 20) {
                paper.currentLink.remove();
              }
            }
            
            // Remove highlight from the last element
            if (paper.lastHoveredElement) {
              highlighters.mask.remove(paper.lastHoveredElement, 'highlight-connect');
              paper.lastHoveredElement = null;
            }
            
            // End batch operation for command manager
            if (paper.linkCreationBatch) {
              graph.trigger('batch:stop');
              paper.linkCreationBatch = false;
            }
            
            paper.currentLink = null;
            paper.linkCreationMode = false;
            paper.linkStartPoint = null;
            paper.currentLinkSource = null;
            selectedToolRef.current = '';
            
            // Restore pan state based on new (empty) tool selection
            updatePanZoomState();
          }
          
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
                      'stroke-width': 3,
                      'stroke': 'rgba(63, 0, 255)',
                  },
                });
                elementRef.current = cellView.model;
                AddDoubleClickTools(cellView, textEditorRef);
                // Use the new function instead of inline event listener
                setupDeleteHandler(cellView);
              }
              const size = cell.size();
              if (size.width < 10 || size.height < 10) cell.remove();
            }

            // Update pan-zoom state based on new tool selection
            updatePanZoomState();
          }
          evt.handled = false;
        },
    };
  return paperEvents;
}
export default PaperEvents