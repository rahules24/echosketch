import { Canvg } from 'canvg';

function exportSVG(paperSVG, bgcolor) {
  console.log("clicked")
  const svgDoc = paperSVG.svg; // acessing svg from paper element
  const clone = svgDoc.cloneNode(true);

  // Get the dimensions of the SVG
  const width = clone.getAttribute('width') || clone.clientWidth || 0;
  const height = clone.getAttribute('height') || clone.clientHeight || 0;

  // Create a new rectangle element to serve as the background
  const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  background.setAttribute('width', width);
  background.setAttribute('height', height);
  background.setAttribute('fill', bgcolor);

  // Insert the rectangle as the first child of the cloned SVG
  clone.insertBefore(background, clone.firstChild);

  // Find and remove the element with the ID 'svg-pan-zoom-controls'
  const panZoomControls = clone.getElementById('svg-pan-zoom-controls');
  if (panZoomControls) {
    panZoomControls.parentNode.removeChild(panZoomControls);
  }

  const serializer = new XMLSerializer();
  return serializer.serializeToString(clone);
}



const exportAsPNGorJPEG = async (paperSVG, format = 'png', bgcolor = '#EDFEFF') => {
  const svgString = exportSVG(paperSVG, bgcolor);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  // Set canvas size based on SVG dimensions
  const svgSize = paperSVG.svg.getBoundingClientRect();
  canvas.width = svgSize.width;
  canvas.height = svgSize.height;

  // Render SVG onto canvas using canvg
  const v = Canvg.fromString(context, svgString);
  v.start();
  await v.render();
  v.stop();

  // Create a download link
  const link = document.createElement('a');
  link.href = canvas.toDataURL(`image/${format}`);
  link.download = `echoSketch.${format}`;
  link.click();
};

export default exportAsPNGorJPEG;