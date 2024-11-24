const RemoveAllTools = (paper, graph) => {
    const cells = graph.getElements();
    cells.forEach(cell => {
      const view = paper.findViewByModel(cell);
      if (view) {
        view.removeTools();
      }
    });
  };

export default RemoveAllTools;