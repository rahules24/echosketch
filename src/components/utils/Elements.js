import { V, dia } from '@joint/core'

/**
 * POINTERS- MIE/POLYGONS
 * BODY- KE/CIRCLE (now oval-capable)
 */

// Helper function to determine the value to use
function getValue(val) {
  return typeof val === 'string' ? val : val.current;
}

const AOPelements = dia.Element.define('AOPelements', {
  attrs: {
    root: {
      magnet: false
    },
    pointers: {
      width: 'calc(w)',
      height: 'calc(h)',
    },
    border: {
      rough: {
        fillSketch: true
      },
      fill: 'none',   //MIE-POLYGONS
    },
    body: {
      fill: 'none',  // KE-CIRCLE/OVAL
    },
    label: {
      textWrap: {
        ellipsis: true,
      },
      // z: 10,
      textVerticalAnchor: 'middle',
      textAnchor: 'middle',
      border: 'none',
      outline: 'none',
      refX: '50%',
      refY: '50%',
      fontSize: 20,
    },
  }
},
// it defines the basic structure of the shape, all the components it has
{
  markup: [
    {
      tagName: 'path',
      selector: 'pointers',
      attributes: {
        'magnet': 'on-shift',
      }
    },
    {
      tagName: 'path',
      selector: 'body',
      attributes: {
        'pointer-events': 'none',
      },
    },
    {
      tagName: 'path',
      selector: 'border',
      attributes: {
        'pointer-events': 'none',
      },
    },
    {
      tagName: 'text',
      selector: 'label',
    }
  ],
},
{
  create: function (
    selectedFontRef,
    // panZoomInstance,
    selectedToolRef,
    strokeRef,
    fillRef,
    roughRef,
    borderRef,
    styleRef) {

    const type = getValue(selectedToolRef);
    const font = getValue(selectedFontRef);
    const fill = getValue(fillRef);
    const border = getValue(borderRef);
    const stroke = getValue(strokeRef);
    // const rough = getValue(roughRef);
    // const style = getValue(styleRef);

    return new this({
      attrs: {
        pointers: { // MIE-POLYGONS
          pointerShape: type,
          fill: fill,  // for all 
        },
        body: {  // KE-CIRCLE/OVAL
          rough: {
            type: type,
          },
          stroke: border, // for all   //BORDER
          strokeWidth: 3,  //BORDER
        },
        label: {
          text: '',
          fontFamily: font
        },
        border: {   // STROKE
          rough: {
            type: type,
          },
          stroke: stroke,
        },
        roughRef: roughRef,
        styleRef: styleRef,
      },
      elementtype: type,
      // panZoomInstance: panZoomInstance,
      selectedToolRef: selectedToolRef,
    });
  },
  attributes: {
    'rough': {
      set: function (opt, bbox) {
        var r = this.paper.rough;
        if (!r) return;
        var shape;
        const roughness = getValue(this.model.attributes.attrs.roughRef);  // Get roughRef directly
        const style = getValue(this.model.attributes.attrs.styleRef);      // Get styleRef directly

        switch (opt.type) {
          case 'MIE':
            shape = r.generator.rectangle(bbox.x, bbox.y, bbox.width, bbox.height, {
              fill: true,
              roughness: roughness,
              hachureGap: 13,
              fillWeight: 4,
              zigzagOffset: 9,
              fillStyle: style,
            });
            break;
          case 'KE':
            // Use ellipse instead of circle to allow for non-uniform scaling
            const centerX = bbox.x + bbox.width / 2;
            const centerY = bbox.y + bbox.height / 2;
            // Use actual width and height for ellipse dimensions
            const radiusX = bbox.width / 2;
            const radiusY = bbox.height / 2;
            
            // Check if rough.js supports ellipse directly
            if (r.generator.ellipse) {
              shape = r.generator.ellipse(centerX, centerY, radiusX * 2, radiusY * 2, {
                fill: true,
                roughness: roughness / 2.5,
                hachureGap: 13,
                fillWeight: 4,
                zigzagOffset: 9,
                fillStyle: style,
              });
            } else {
              // Fallback to using a custom path for ellipse if rough.js doesn't support ellipse directly
              // Create an ellipse path
              const kappa = 0.5522848;
              const ox = radiusX * kappa; // Control point offset horizontal
              const oy = radiusY * kappa; // Control point offset vertical
              
              // Build the ellipse path
              const ellipsePath = [
                ['M', centerX - radiusX, centerY],
                ['C', centerX - radiusX, centerY - oy, centerX - ox, centerY - radiusY, centerX, centerY - radiusY],
                ['C', centerX + ox, centerY - radiusY, centerX + radiusX, centerY - oy, centerX + radiusX, centerY],
                ['C', centerX + radiusX, centerY + oy, centerX + ox, centerY + radiusY, centerX, centerY + radiusY],
                ['C', centerX - ox, centerY + radiusY, centerX - radiusX, centerY + oy, centerX - radiusX, centerY],
                ['Z']
              ];
              
              // Convert path to SVG path string
              const pathData = ellipsePath.map(segment => segment.join(' ')).join(' ');
              
              // Use roughjs to draw the path
              shape = r.generator.path(pathData, {
                fill: true,
                roughness: roughness / 2.5,
                hachureGap: 13,
                fillWeight: 4,
                zigzagOffset: 9,
                fillStyle: style,
              });
            }
            break;
          case 'AOP':
            shape = r.generator.polygon([ // don't use polygon if you want edges rounded
              [bbox.x, bbox.y + bbox.height],
              [bbox.x + bbox.width / 2, bbox.y],
              [bbox.x + bbox.width, bbox.y + bbox.height]
            ], {
              fill: true,
              roughness: roughness,
              hachureGap: 13,
              fillWeight: 4,
              zigzagOffset: 9,
              fillStyle: style,
            });
            break;
          case 'AO':
            shape = r.generator.polygon([
              [bbox.x, bbox.y + bbox.height / 2],
              [bbox.x + bbox.width / 2, bbox.y],
              [bbox.x + bbox.width, bbox.y + bbox.height / 2],
              [bbox.x + bbox.width / 2, bbox.y + bbox.height]
            ], {
              fill: true,
              roughness: roughness,
              hachureGap: 13,
              fillWeight: 4,
              zigzagOffset: 9,
              fillStyle: style,
            });
            break;
          default:
            return;
        }
        if (shape && shape.sets) {
          var sets = shape.sets;
          return { d: r.opsToPath(sets[opt.fillSketch ? 0 : 1]) };
        }
      }
    },
    'pointer-shape': {
      set: function (type, bbox) {
        var vel;
        var width = bbox.width;
        var height = bbox.height;

        switch (type) {
          case 'MIE':
            vel = V('rect').attr({
              'width': width,
              'height': height,
            });
            break;
          case 'KE':
            // Use ellipse instead of circle to allow for non-uniform scaling
            vel = V('ellipse').attr({
              'cx': width / 2,
              'cy': height / 2,
              'rx': width / 2,   // Use actual width for x-radius
              'ry': height / 2,  // Use actual height for y-radius
            });
            break;
          case 'AOP':
            vel = V('polygon').attr({
              'points': `${bbox.x},
                          ${bbox.y + bbox.height} ${bbox.x + bbox.width / 2},
                          ${bbox.y} ${bbox.x + bbox.width},
                          ${bbox.y + bbox.height}`,
            });
            break;
          case 'AO':
            vel = V('polygon').attr({
              'points': `${bbox.x + bbox.width / 2},
                          ${bbox.y} ${bbox.x + bbox.width},
                          ${bbox.y + bbox.height / 2} ${bbox.x + bbox.width / 2},
                          ${bbox.y + bbox.height} ${bbox.x},
                          ${bbox.y + bbox.height / 2}`,
            });
            break;
          default:
            // this.model.attributes.panZoomInstance.disablePan();
            this.model.attributes.selectedToolRef.current = '';
            return;
        }
        return { d: vel.convertToPathData() };
      }
    }
  }
});

export default AOPelements;