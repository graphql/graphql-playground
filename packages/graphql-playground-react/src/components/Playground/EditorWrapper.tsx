import * as React from 'react'
import { styled, ThemeProvider, theme } from '../../styled'
import { connect } from 'react-redux'

const EditorWrapper = styled.div`
  .cm-property {
    ${p => p.theme.editorColours.property};
  }

  display: flex;
  flex: 1 1 0;
`

const Wrapper = ({ children }) => (
  <ThemeProvider theme={theme}>
    <EditorWrapper>{children}</EditorWrapper>
  </ThemeProvider>
)

export default connect()(Wrapper)
