import { V, dia } from '@joint/core'

/**
 * POINTERS- MIE/POLYGONS
 * BODY- KE/CIRCLE
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
      fill: 'none',  // KE-CIRCLE
    },
    label: {
      textWrap: {
        ellipsis: true,
      },
      z: 10,
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
        body: {  // KE-CIRCLE
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
            const centerX = bbox.x + bbox.width / 2;
            const centerY = bbox.y + bbox.height / 2;
            const radius = Math.min(bbox.width / 2, bbox.height / 2);
            shape = r.generator.circle(centerX, centerY, radius * 2, {
              fill: true,
              roughness: roughness / 2.5,
              hachureGap: 13,
              fillWeight: 4,
              zigzagOffset: 9,
              fillStyle: style,
            });
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
            vel = V('circle').attr({
              'cx': width / 2,
              'cy': height / 2,
              'r': Math.min(width, height) / 2,
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
