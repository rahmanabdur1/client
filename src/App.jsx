import React, { useState } from 'react';
import './App.css';

function App() {
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [previewHtml, setPreviewHtml] = useState('');
  const [sourceCode, setSourceCode] = useState('');

  const addElement = (type) => {
    const newElement = {
      id: Date.now(),
      type: type,
      content: type === 'text' ? 'Edit me!' : 
               type === 'table' ? [[]] : 
               type === 'unordered-list' || type === 'ordered-list' ? ['Item 1', 'Item 2', 'Item 3'] : '',
      x: 50,
      y: 50,
      width: type === 'image' ? 200 : '',
      height: type === 'image' ? 100 : '',
      width: type === 'table' ? 200 : 200,
      height: type === 'table' ? 100 : 30,
      style: { fontSize: '16px', color: '#000', textAlign: 'left', fontFamily: 'Arial', fontStyle: 'normal', lineHeight: '1.5', marginBottom: '0' },
    };
    setElements([...elements, newElement]);
  };

  const updateElement = (id, updatedProperties) => {
    setElements(elements.map((el) => (el.id === id ? { ...el, ...updatedProperties } : el)));
  };

  const selectElement = (element) => {
    setSelectedElement(element);
  };

  const updateTextContent = (content) => {
    if (selectedElement && selectedElement.type === 'text') {
      updateElement(selectedElement.id, { content });
    }
  };

  const updateTextStyle = (property, value) => {
    if (selectedElement && selectedElement.type === 'text') {
      updateElement(selectedElement.id, { style: { ...selectedElement.style, [property]: value } });
    }
  };

  const makeDraggable = (e, element) => {
    const startX = e.clientX;
    const startY = e.clientY;
    const startPosX = element.x;
    const startPosY = element.y;

    const onMouseMove = (e) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      updateElement(element.id, { x: startPosX + dx, y: startPosY + dy });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const makeResizable = (e, element, side) => {
    const startX = e.clientX;
    const startWidth = element.width;

    const onMouseMove = (e) => {
      const dx = e.clientX - startX;
      if (side === 'right') {
        updateElement(element.id, { width: startWidth + dx });
      } else if (side === 'left') {
        updateElement(element.id, { width: startWidth - dx, x: element.x + dx });
      }
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const togglePreview = () => {
    const htmlOutput = elements.map(el => {
      if (el.type === 'text') return `<p style="font-size:${el.style.fontSize}; color:${el.style.color}; text-align:${el.style.textAlign}; font-family:${el.style.fontFamily}; font-style:${el.style.fontStyle}; line-height:${el.style.lineHeight}; margin-bottom:${el.style.marginBottom};">${el.content}</p>`;
      if (el.type === 'table') return `<table>${el.content.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</table>`;
      if (el.type === 'unordered-list') return `<ul>${el.content.map(item => `<li>${item}</li>`).join('')}</ul>`;
    
      return '';
    }).join('');
    setPreviewHtml(htmlOutput);
    alert(htmlOutput); // or display it in a modal
  };

  const seeSourceCode = () => {
    const codeOutput = JSON.stringify(elements, null, 2);
    setSourceCode(codeOutput);
    alert(codeOutput); // or display it in a modal
  };

  return (
    <div className="App">
      <h2>Drag and Drop Editor</h2>
      <div className="top-bar">
        <button onClick={togglePreview}>Preview</button>
        <button onClick={seeSourceCode}>See Source Code</button>
      </div>
      <div className="layout">
        <div className="sidebar">
          <button onClick={() => addElement('text')}>Add Text</button>
          <button onClick={() => addElement('image')}>Add Image</button>
          <button onClick={() => addElement('table')}>Add Table</button>
          <button onClick={() => addElement('unordered-list')}>Add Unordered List</button>
        </div>

        <div className="canvas" id="canvas">
          {elements.map(element => (
            <div
              key={element.id}
              className={`element ${selectedElement?.id === element.id ? 'selected' : ''}`}
              style={{
                left: element.x,
                top: element.y,
                width: element.width,
                height: element.height,
                fontSize: element.style.fontSize,
                color: element.style.color,
                textAlign: element.style.textAlign,
                fontFamily: element.style.fontFamily,
                fontStyle: element.style.fontStyle,
                lineHeight: element.style.lineHeight,
                marginBottom: element.style.marginBottom,
                position: 'absolute',
                // border: '1px dashed #d3d3d3',
                cursor: 'move',
              }}
              onMouseDown={(e) => {
                selectElement(element);
                makeDraggable(e, element);
              }}
              contentEditable={element.type === 'text'}
              onInput={(e) => updateTextContent(e.target.innerText)}
            >
              {element.type === 'text' ? element.content : null}
              {element.type === 'table' ? (
                <table>
                  <tbody>
                    {element.content.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cellContent, colIndex) => (
                          <td key={colIndex} contentEditable>{cellContent}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : null}
              {element.type === 'unordered-list' ? (
                <ul>
                  {element.content.map((item, index) => (
                    <li key={index} contentEditable>{item}</li>
                  ))}
                </ul>
              ) : null}
              

              {/* Left resize handle */}
              <div
                className="resize-handle left"
                onMouseDown={(e) => {
                  e.stopPropagation(); // Prevent the drag event
                  makeResizable(e, element, 'left');
                }}
              />

              {/* Right resize handle */}
              <div
                className="resize-handle right"
                onMouseDown={(e) => {
                  e.stopPropagation(); // Prevent the drag event
                  makeResizable(e, element, 'right');
                }}
              />
            </div>
          ))}
        </div>

        <div className="modification-tools">
          {selectedElement?.type === 'text' && (
            <div>
              <h4>Text Properties</h4>
              <div className='text'>
              
              <textarea
                onInput={(e) => updateTextContent(e.target.value)}
                defaultValue={selectedElement.content}
              />

              {/* Font Family */}
              <label>Font:
                <select onChange={(e) => updateTextStyle('fontFamily', e.target.value)}>
                  <option value="Arial">Arial</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Verdana">Verdana</option>
                </select>
              </label>

              {/* Font Style */}
              <label>Font Style:
                <select onChange={(e) => updateTextStyle('fontStyle', e.target.value)}>
                  <option value="normal">Normal</option>
                  <option value="italic">Italic</option>
                  <option value="oblique">Oblique</option>
                </select>
              </label>

              {/* Font Size */}
              <label>Font Size:
                <input type="number"
                  onChange={(e) => updateTextStyle('fontSize', `${e.target.value}px`)}
                />
              </label>

              {/* Color */}
              <label>Color:
                <input type="color"
                  onChange={(e) => updateTextStyle('color', e.target.value)}
                />
              </label>

              {/* Alignment */}
              <label>Alignment:
                <select onChange={(e) => updateTextStyle('textAlign', e.target.value)}>
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </label>

              {/* Line Height */}
              <label>Line Height:
                <input type="number"
                  step="0.1"
                  onChange={(e) => updateTextStyle('lineHeight', e.target.value)}
                />
              </label>

              {/* Line Spacing */}
              <label>Line Spacing (margin-bottom):
                <input type="number"
                  onChange={(e) => updateTextStyle('marginBottom', `${e.target.value}px`)}
                />
              </label>
              </div>
            </div>
          )}

          {selectedElement?.type === 'unordered-list' && (
            <div>
              <h4>List Properties</h4>

              {/* List Items */}
              <label>List Items (one per line):
                <textarea
                  onInput={(e) => {
                    const items = e.target.value.split('\n').filter(item => item);
                    updateElement(selectedElement.id, { content: items });
                  }}
                  defaultValue={selectedElement.content.join('\n')}
                />
              </label>

              {/* List Type */}
              <label>List Type:
                <select onChange={(e) => updateElement(selectedElement.id, { type: e.target.value })}>
                  <option value="unordered-list">Unordered List</option>
      
                </select>
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;


