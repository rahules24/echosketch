import { elementTools } from '@joint/core';

const CreateResizeButton = (x, y, model, curtype, flagC, flagF) => {
    return new elementTools.Button({
      markup: [{
        tagName: 'circle',
        selector: 'button',
        attributes: {
          'r':7,
          // 'width': 50, // Here Dynamic dimensions can be provided, if required
          // 'height': 50,
          'fill': '#33334F',    //recommended to change color while fixing issues
          'cursor': curtype
        }
      }, {
          tagName: "path",
          selector: "icon",
          attributes: {
            d: "M -3 -3 3 3 M 3 -2 3 3 -2 3",
            stroke: "#ffffff",
            "stroke-width": 2,
            fill: "none"
        }
      }],
      y: '100%',
      x: '100%',
      offset: {
        x: 0,
        y: 0
    },
      action: function ({ clientX, clientY }) {
        model.graph.trigger('batch:start');
        const handleData = {
          initialPosition: { x: 0, y: 0 },
          initialSize: { width: 0, height: 0 },
          resizing: true,
          shape: model
        };

        const handlePointerMove = (evt) => {
          const currentPosition = { x: evt.clientX, y: evt.clientY };
          const deltaX = flagC * currentPosition.x - flagF * handleData.initialPosition.x;
          const deltaY = flagC * currentPosition.y - flagF * handleData.initialPosition.y;
        
          const scaleX = (handleData.initialSize.width + deltaX) / handleData.initialSize.width;
          const scaleY = (handleData.initialSize.height + deltaY) / handleData.initialSize.height;
        
          let newWidth = handleData.initialSize.width * scaleX;
          let newHeight = handleData.initialSize.height * scaleY;
        
          // Set minimum size limits
          const MIN_SIZE = 10;
          newWidth = Math.max(MIN_SIZE, newWidth);
          newHeight = Math.max(MIN_SIZE, newHeight);

          handleData.shape.resize(newWidth, newHeight);
        };

        const handlePointerUp = () => {
          model.graph.trigger('batch:stop');
          document.removeEventListener('mousemove', handlePointerMove);
          document.removeEventListener('mouseup', handlePointerUp);
          handleData.resizing = false;
          const size = handleData.shape.size();
          if (size.width < 10 || size.height < 10) {
            handleData.shape.remove();
          }
        };

        handleData.initialPosition = { x: clientX, y: clientY };
        handleData.initialSize = model.size();

        document.addEventListener('mousemove', handlePointerMove);
        document.addEventListener('mouseup', handlePointerUp, { once: true });
      }
    });
  };

export default CreateResizeButton;