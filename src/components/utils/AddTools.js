import { dia, elementTools } from '@joint/core';
import CreateResizeButton from './ResizeButton';

const AddDoubleClickTools = (elementView, textEditorRef) => {

    elementView.addTools(new dia.ToolsView({
      tools: [
        new elementTools.Remove({
          useModelGeometry: false,
          x: '100%',
          action: function () {
            elementView.model.remove();
            textEditorRef.current.blur();
          },
        }),
        new elementTools.Boundary({
          padding: 4,
          rotate: true,
          useModelGeometry: false,
        }),
        new elementTools.Button({
          markup: [{
            tagName: 'circle',
            selector: 'button',
            attributes: {
              'r': 7,
              'fill': 'green',
              'cursor': 'pointer'
            }
          }, {
            tagName: 'path',
            selector: 'icon',
            attributes: {
              'd': 'M -3 -3 3 3 M -3 3 3 -3',
              'fill': 'none',
              'stroke': '#FFFFFF',
              'stroke-width': 2,
              'pointer-events': 'none'
            }
          }],
          x: '0%',
          action: function () {
            elementView.removeTools();
            textEditorRef.current.blur();
          }
        }),
        CreateResizeButton('93%', '93%', elementView.model, 'nwse-resize', 1, 1),
      ]
    }));
  };

export default AddDoubleClickTools;