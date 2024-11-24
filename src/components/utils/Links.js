import { dia } from '@joint/core';

export const RoughLink = dia.Link.define('RoughLink',
  //1
  {
    z: 1,
    connector: { name: 'smooth' },
    attrs: {
      line: {
        stroke: 'black',
        rough: { bowing: 10 },
        roughness: 15,
        strokeWidth: 2,
        strokeLinejoin: 'round',
        targetMarker: {
          type: 'path',
          d: 'M 10 -5 0 0 10 5 z'
        }
      },
      wrapper: {
        connection: true,
        strokeWidth: 10,
        strokeLinejoin: 'round'
      }
    }
  },
  //2
  {
    markup: [{
      tagName: 'path',
      selector: 'wrapper',
      attributes: {
        fill: 'none',
        cursor: 'pointer',
        stroke: 'transparent',
        'stroke-linecap': 'round'
      }
    }, {
      tagName: 'path',
      selector: 'line',
      attributes: {
        fill: 'none',
        'pointer-events': 'none'
      }
    }]
  },
  //3
  {  
    attributes: {
      'rough': {
        set: function(opt) {
          var r = this.paper.rough;
          if (!r) return;
          var rOpt = {
            bowing: opt.bowing || 10,
          };
          return { d: r.opsToPath(r.generator.path(this.getSerializedConnection(), rOpt).sets[0]) };
        }
      }
    }
  }
);

export const UpdateLinkEndpoints = (element, graph) => {
    const links = graph.getConnectedLinks(element);
    links.forEach(link => {
      const sourceId = link.get('source').id;
      const targetId = link.get('target').id;
      
      if (sourceId === element.id) {
        link.source(element);
      }
      if (targetId === element.id) {
        link.target(element);
      }
    });
  };