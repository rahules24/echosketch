/**
   const paperSmallRef = useRef(null);
 
    const RoughSmall = rough.svg(paperSmall.svg);
    paperSmall.rough = RoughSmall;


        const panZoomInstance = svgPanZoom(Rough.svg, {
          dblClickZoomEnabled: false,
          minZoom: 0.1,
          maxZoom: 5,
          onUpdatedCTM: function(matrix) {
            const scaleFactor = 0.25;
            const { a, d, e, f } = matrix;
            const { a: ca, d: cd, e: ce, f: cf } = panZoomInstance.getZoom();
            const translateChanged = e !== ce || f !== cf;
            if (translateChanged) {
              paper.trigger('translate', e - ce, f - cf);
              paperSmall.translate(e * scaleFactor, f * scaleFactor);
            }
            const scaleChanged = a !== ca || d !== cd;
            if (scaleChanged) {
              paper.trigger('scale', a, d, e, f);
              paperSmall.scale(a * scaleFactor, d * scaleFactor);
            }
          }
        });



   updateSmallPaperSize();

   const scaleContentToFit = () => {
   paper.transformToFitContent({padding: 20, minScaleX: 0.3, minScaleY: 0.3, maxScaleX: 1 , maxScaleY: 1});
   paperSmall.transformToFitContent({padding: 20, minScaleX: 0.075, minScaleY: 0.075, maxScaleX: 0.25 , maxScaleY: 0.25});
   }

   const handPaperResize = () => {
     // util.debounce(scaleContentToFit);
     scaleContentToFit();
     updateSmallPaperSize();
   }



     const updateSmallPaperSize = () => {
       if (paperSmallRef.current) {
         const smallPaperElement = paperSmallRef.current;
         
         const width = window.innerWidth * 0.25; 
         const height = window.innerHeight * 0.25;
         const left = window.innerWidth - width - 20; 
         const top = 20;
   
         smallPaperElement.style.width = `${width}px`;
         smallPaperElement.style.height = `${height}px`;
         smallPaperElement.style.left = `${left}px`;
         smallPaperElement.style.top = `${top}px`;
       }
     };

         const paperSmall = new dia.Paper({
      el: paperSmallRef.current,
      model: graph,
      gridSize: 1,
      interactive: false,
      cellViewNamespace: customNamespace,
    });

      <div
        ref={paperSmallRef}
        id="paper-small"
        style={{
          zIndex: 10000,
          background: '#000',
        }}
      />

 */