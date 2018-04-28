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
`

const Wrapper = ({ children }) => <EditorWrapper>{children}</EditorWrapper>

export default Wrapper
