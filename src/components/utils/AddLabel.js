const AddLabel = (commandManager, elementView, textEditorRef) => {
    const model = elementView.model;
    const textEditor = textEditorRef.current;
    const initialLabelText = model.attr('label/text');
    const ptrattr = model.attr('pointers');
    const bodyattr = model.attr('body');
    const bdrattr = model.attr('border');

    commandManager.cm.stopListening();
    model.attr({
      pointers: {
        fill: 'white',
      },
      border: {
        stroke: 'yellow',
      },
      body: {
        stroke: 'red',
        strokeWidth: 4,
      },
    });
    commandManager.listen();
    
    textEditor.textContent = initialLabelText;

    const onBlur = () => {
        const finalText = textEditor.textContent;
        model.attr('label/text', finalText);

        textEditor.removeEventListener('blur', onBlur);
        textEditor.removeEventListener('input', onInput);

        commandManager.cm.stopListening();
        model.attr({
          border: {
            stroke: bdrattr.stroke,
          },
          pointers: {
            fill: ptrattr.fill,
          },
          body: {
            stroke: bodyattr.stroke,
            strokeWidth: bodyattr.strokeWidth,
          },
        });
        commandManager.listen();
    };

    const onInput = () => {
        const text = textEditor.textContent;
        model.attr('label/text', text);
    };

    const setCaretToEnd = () => {
        const selection = window.getSelection();
        const range = document.createRange();
        if (textEditor.childNodes.length > 0) {
            range.setStart(textEditor.childNodes[0], textEditor.textContent.length);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    };

    textEditor.addEventListener('blur', onBlur);
    textEditor.addEventListener('input', onInput);
    textEditor.focus();
    setCaretToEnd();
  };

export default AddLabel;