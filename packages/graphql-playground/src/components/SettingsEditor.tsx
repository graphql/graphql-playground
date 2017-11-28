import * as React from 'react'
import { styled } from '../styled'
import * as theme from 'styled-theming'
import { VariableEditor } from 'graphiql/dist/components/VariableEditor'
import { Button } from './Playground/TopBar/TopBar'

export interface Props {
  value: string
  onChange: (value: string) => void
  onSave: () => void
}

export default class SettingsEditor extends React.Component<Props, {}> {
  render() {
    return (
      <Wrapper className="graphiql-container">
        <div className="editorWrap">
          <div className="variable-editor">
            <VariableEditor
              value={this.props.value}
              onEdit={this.props.onChange}
              onRunQuery={this.props.onSave}
            />
          </div>
        </div>
        <ButtonWrapper>
          <Button onClick={this.props.onSave}>Save Config</Button>
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
