import * as React from 'react'
import { styled } from '../styled'
import { QueryEditor } from './Playground/QueryEditor'
import { createStructuredSelector } from 'reselect'
import { getFile } from '../state/sessions/selectors'
import { editFile } from '../state/sessions/actions'
import EditorWrapper, { Container } from './Playground/EditorWrapper'
import { connect } from 'react-redux'

export interface Props {
  value: string
  onChange: (value: string) => void
}

class FileEditor extends React.Component<Props, {}> {
  render() {
    return (
      <Container>
        <Wrapper>
          <EditorWrapper>
            <QueryWrap>
              <QueryEditor
                value={this.props.value}
                onChange={this.props.onChange}
              />
            </QueryWrap>
          </EditorWrapper>
        </Wrapper>
      </Container>
    )
  }
}

const mapStateToProps = createStructuredSelector({
  value: getFile,
})

export default connect(
  mapStateToProps,
  { onChange: editFile },
)(FileEditor)

const Wrapper = styled.div`
  background: ${p => p.theme.editorColours.resultBackground};
  position: relative;
  .variable-editor {
    height: 100% !important;
  }
  .CodeMirror {
    background: none !important;
    .CodeMirror-code {
      color: rgba(255, 255, 255, 0.7);
    }
    .cm-atom {
      color: rgba(42, 126, 210, 1);
    }
  }
`

const QueryWrap = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`
