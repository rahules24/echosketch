function CheckCollision(cellView, graph, paper) {
    const cellBBox = cellView.getBBox();
    const elements = graph.getElements();

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      if (element.id === cellView.model.id) continue;

      const elementView = paper.findViewByModel(element);
      const elementBBox = elementView.getBBox();

      if (cellBBox.intersect(elementBBox)) {
        return true;
      }
    }
    return false;
  }

export default CheckCollision;