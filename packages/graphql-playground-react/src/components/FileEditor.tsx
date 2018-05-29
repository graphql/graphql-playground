import * as React from 'react'
import { styled } from '../styled'
import * as theme from 'styled-theming'
import { QueryEditor } from './Playground/QueryEditor'
import { createStructuredSelector } from 'reselect'
import { getFile } from '../state/sessions/selectors'
import { editFile } from '../state/sessions/actions'
import { connect } from 'react-redux'

export interface Props {
  value: string
  onChange: (value: string) => void
}

class FileEditor extends React.Component<Props, {}> {
  render() {
    return (
      <Wrapper className="graphiql-container">
        <div className="editorWrap">
          <div className="queryWrap">
            <QueryEditor
              value={this.props.value}
              onChange={this.props.onChange}
            />
          </div>
        </div>
      </Wrapper>
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

const backgroundColor = theme('mode', {
  light: p => p.theme.colours.darkBlue10,
  dark: p => p.theme.colours.darkBlue,
})

const Wrapper = styled.div`
  background: ${backgroundColor};
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
  .CodeMirror-gutters {
    background: none !important;
  }
`
