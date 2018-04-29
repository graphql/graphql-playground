import * as React from 'react'
import { styled } from '../../styled'

const EditorWrapper = styled.div`
  .cm-property {
    color: ${p => p.theme.editorColours.property};
  }

  display: flex;
  flex: 1 1 0;
  flex-flow: column;

  .CodeMirror {
    color: rgba(255, 255, 255, 0.3);
    font-family: 'Source Code Pro', 'Consolas', 'Inconsolata', 'Droid Sans Mono',
      'Monaco', monospace;
    font-size: 14px;
    height: 100%;
    left: 0;
    position: absolute;
    top: 0;
    width: 100%;
  }

  .CodeMirror-lines {
    padding: 20px 0;
  }

  .toolbar-button {
    background: #fdfdfd;
    background: linear-gradient(#fbfbfb, #f8f8f8);
    border-color: #d3d3d3 #d0d0d0 #bababa;
    border-radius: 4px;
    border-style: solid;
    border-width: 0.5px;
    box-shadow: 0 1px 1px -1px rgba(0, 0, 0, 0.13), inset 0 1px #fff;
    color: #444;
    cursor: pointer;
    display: inline-block;
    margin: 0 5px 0;
    padding: 2px 8px 4px;
    text-decoration: none;
  }
  .toolbar-button:active {
    background: linear-gradient(#ececec, #d8d8d8);
    border-color: #cacaca #c9c9c9 #b0b0b0;
    box-shadow: 0 1px 0 #fff, inset 0 1px rgba(255, 255, 255, 0.2),
      inset 0 1px 1px rgba(0, 0, 0, 0.08);
  }
  .toolbar-button.error {
    background: linear-gradient(#fdf3f3, #e6d6d7);
    color: #b00;
  }
`

const Wrapper = ({ children }) => <EditorWrapper>{children}</EditorWrapper>

export default Wrapper
