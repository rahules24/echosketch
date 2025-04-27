const AddLabel = (commandManager, elementView, textEditorRef) => {
  const model = elementView.model;
  const textEditor = textEditorRef.current;
  const initialLabelText = model.attr('label/text');
  const ptrattr = model.attr('pointers');
  const bodyattr = model.attr('body');
  const bdrattr = model.attr('border');
  
  // Show the editor with fade-in effect
  textEditor.style.display = 'block';
  textEditor.style.opacity = '1';

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

  textEditor.style.whiteSpace = "pre-wrap";
  textEditor.style.outline = "none";
  textEditor.style.caretColor = "black";
  textEditor.style.userSelect = "text";
  textEditor.setAttribute("contenteditable", "true");
  textEditor.textContent = initialLabelText;
  
  const onBlur = () => {
    const finalText = textEditor.textContent;
    model.attr('label/text', finalText);
    
    // Hide the editor with fade-out effect
    textEditor.style.opacity = '0';
    setTimeout(() => {
      textEditor.style.display = 'none';
    }, 200); // Match this with the CSS transition duration
    
    textEditor.removeEventListener('blur', onBlur);
    textEditor.removeEventListener('input', onInput);
    textEditor.removeEventListener('keydown', onKeyDown);
    
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
  const onKeyDown = (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        
        // Insert a line break at the current cursor position
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const lineBreak = document.createTextNode('\n\n');
        range.deleteContents();
        range.insertNode(lineBreak);
        
        // Move the cursor after the inserted line break
        range.setStartAfter(lineBreak);
        range.setEndAfter(lineBreak);
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Update the model with the new text including line breaks
        model.attr('label/text', textEditor.textContent);
    } else if (event.key === ' ') {
        // Handle space key to preserve multiple spaces using non-breaking space
        event.preventDefault();
        
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        
        // Use a non-breaking space character
        const space = document.createTextNode('\u00A0');
        range.deleteContents();
        range.insertNode(space);
        
        // Move cursor after the inserted space
        range.setStartAfter(space);
        range.setEndAfter(space);
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Update the model
        model.attr('label/text', textEditor.textContent);
    }
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
  textEditor.addEventListener('keydown', onKeyDown);
  textEditor.focus();
  setCaretToEnd();
};
export default AddLabel;