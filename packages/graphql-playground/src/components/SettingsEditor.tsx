import * as React from 'react'
import { styled } from '../styled'
import * as theme from 'styled-theming'
import { Button } from './Playground/TopBar/TopBar'
import { ConfigEditor } from './Playground/ConfigEditor'

export interface Props {
  value: string
  onChange: (value: string) => void
  onSave: () => void
  isYaml?: boolean
  isConfig?: boolean
}

export default class SettingsEditor extends React.Component<Props, {}> {
  render() {
    const { isConfig } = this.props
    return (
      <Wrapper className="graphiql-container">
        <div className="editorWrap">
          <div className="variable-editor">
            <ConfigEditor
              value={this.props.value}
              onEdit={this.props.onChange}
              onRunQuery={this.props.onSave}
              isYaml={this.props.isYaml}
            />
          </div>
        </div>
        <ButtonWrapper>
          <Button onClick={this.props.onSave}>
            Save {isConfig ? `Config` : `Settings`}
          </Button>
        </ButtonWrapper>
      </Wrapper>
    )
  }
}

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

const ButtonWrapper = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 2;
`
