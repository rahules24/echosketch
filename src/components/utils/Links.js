// Updated Links.js with self-link support

import { dia } from '@joint/core';

export const RoughLink = dia.Link.define('RoughLink',  //1  
{
  // z: 1000,
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
  },
  // Add property to track if this is a self-link
  isSelfLink: false
},  //2  
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
},  //3  
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
  },
  
  // Add additional prototype methods for self-link handling
  initialize: function() {
    dia.Link.prototype.initialize.apply(this, arguments);
    
    // Check if source and target are the same when they change
    this.on('change:source change:target', this.updateSelfLinkStatus, this);
    this.updateSelfLinkStatus();
  },
  
  updateSelfLinkStatus: function() {
    const source = this.get('source');
    const target = this.get('target');

    const isSelfLink = 
      source && target &&
      typeof source === 'object' && typeof target === 'object' &&
      source.id && target.id &&
      source.id === target.id;

    this.set('isSelfLink', isSelfLink);
  }
});

export const UpdateLinkEndpoints = (element, graph) => {
  const links = graph.getConnectedLinks(element);
  links.forEach(link => {
    const sourceId = link.get('source').id;
    const targetId = link.get('target').id;
        
    // Check if this is a self-link
    const isSelfLink = sourceId === element.id && targetId === element.id;
    
    if (isSelfLink) {
      const oldSize = element.previous('size');
      const newSize = element.size();
      const position = element.position();
      const vertices = link.get('vertices') || [];

if (oldSize) {
  let currentVertices = vertices;

  if (currentVertices.length === 0) {
    // Insert a default middle vertex for proper scaling
    const mid = {
      x: position.x + newSize.width / 2 + 40,
      y: position.y + newSize.height / 2 - 40
    };
    currentVertices = [mid];
    link.set('vertices', currentVertices);
  }

  const scaledVertices = currentVertices.map(vertex => {
    const relX = (vertex.x - position.x) / oldSize.width;
    const relY = (vertex.y - position.y) / oldSize.height;

    return {
      x: position.x + relX * newSize.width,
      y: position.y + relY * newSize.height
    };
  });

  link.set('vertices', scaledVertices);
}

    } else {
          // Regular link handling (your existing code)
          if (sourceId === element.id) {
            link.source(element);
          }
          if (targetId === element.id) {
            link.target(element);
          }
        }
  });
};