import React, { useEffect, useRef, useState } from 'react';
import MonacoEditor from 'react-monaco-editor';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import './App.css';

const { convertCodeToFlowTree, createSVGRender, createShapesTreeEditor } = window.js2flowchart;
const code = `
    const doStuff = (stuff: string) => {
        if (stuff) {
            if (devFlag) {
                log('perf start');
                doRecursion();
                log('perf end');

                return;
            }

            doRecursion();
            end();
        } else {
            throw new Error('No stuff!');
        }

        return null;
    };
`;

const svgRender = createSVGRender();

function App() {
  const ref = useRef<HTMLDivElement>(null);
  const [text, setText] = useState(code);
  function onChangeHandle(value: any) {
    setText(value);
  }
  useEffect(() => {
    try {
      const flowTree = convertCodeToFlowTree(text);
      const shapesTree = svgRender.buildShapesTree(flowTree);
      console.log('flowTree', flowTree);
      const shapesTreeEditor = createShapesTreeEditor(shapesTree);
      shapesTreeEditor.blurShapeBranch((shape: any) => shape.getName() === '(devFlag)');
      const svg = shapesTreeEditor.print();
      if (ref.current) {
        ref.current.innerHTML = svg;
      }
    } catch (error) {
      console.error(error)
    }
  }, [text]);
  return (
    <div className="App">
      <PanelGroup autoSaveId="code-graph" direction="horizontal">
        <Panel defaultSize={50} order={1}>
          <MonacoEditor
            width="100%"
            height="100%"
            language="typescript"
            theme="vs-dark"
            value={text}
            onChange={onChangeHandle}
            options={{
              selectOnLineNumbers: true,
              matchBrackets: 'near',
            }}
          />
        </Panel>
        <PanelResizeHandle />
        <Panel order={2}>
          <div style={{ height: '100%', overflow: 'auto' }}>
            <div ref={ref} className="code-image" />
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}

export default App;
