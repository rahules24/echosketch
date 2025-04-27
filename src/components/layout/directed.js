import { DirectedGraph } from '@joint/layout-directed-graph';

export default function applyDirectedLayout(graph) {
  // do nothing if the graph is empty
  if (graph.getElements().length === 0) return;

  // Apply the initial layout to the graph
  DirectedGraph.layout(graph, {
    setLinkVertices: true,
    marginX: 5,
    marginY: 5,
    padding: 5,
  });

  // Translate the graph elements to the center horizontally
  const graphBBox = graph.getBBox();
  const offsetX = (window.innerWidth - graphBBox.width) / 2;
  graph.translate(offsetX, 100);
};
