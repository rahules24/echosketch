// Module handles the download and rendering of network in the form of json

export const exportGraphAsJSON = (paperRef) => {
  if (paperRef.current) {
    const graph = paperRef.current.model;
    graph.set('graphExportTime', Date.now());
    
    // This is causing the constructor issue, need to define the elements in the constructor
    // graph.fromJSON(graph.toJSON()); use this code to check, namespace are defined correctly or not
    const json = graph.toJSON();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(json));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "echoSketch.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }
};

export const importGraphFromJSON = (paperRef, event) => {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = (e) => {
    const json = JSON.parse(e.target.result);
    const currentGraph = paperRef.current.model.toJSON();
    
    // TODO: Use appropriate naming for the graph, it will cause issue latter 
    // Merge the elements from the imported JSON with the existing graph
    const mergedGraph = {...currentGraph,cells: [...currentGraph.cells, ...json.cells]};

    paperRef.current.model.fromJSON(mergedGraph);
  };

  reader.readAsText(file);
};

