import * as React from 'react'
import { styled } from '../styled'
import { Button } from './Playground/TopBar/TopBar'
import { ConfigEditor } from './Playground/ConfigEditor'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { getConfigString } from '../state/general/selectors'
import { setSettingsString, setConfigString } from '../state/general/actions'
import { editSettings, saveSettings } from '../state/sessions/actions'
import { getSettingsString } from '../state/workspace/reducers'
import EditorWrapper, { Container } from './Playground/EditorWrapper'

export interface Props {
  value: string
  onChange: (value: string) => void
  onSave: () => void
  isYaml?: boolean
  isConfig?: boolean
  readOnly?: boolean
}

// TODO: Trigger onSave on CMD+S or CTRL+S

export class SettingsEditor extends React.Component<Props, {}> {
  componentDidMount() {
    window.addEventListener('keydown', this.handleKeydown, true)
  }

  render() {
    const { isConfig } = this.props
    return (
      <Container>
        <Wrapper>
          <EditorWrapper>
            <ConfigEditor
              value={this.props.value}
              onEdit={this.props.onChange}
              onRunQuery={this.props.onSave}
              isYaml={this.props.isYaml}
              readOnly={this.props.readOnly}
            />
            <PlaygroundVersion>{window.version}</PlaygroundVersion>
          </EditorWrapper>
          {!this.props.readOnly && (
            <ButtonWrapper>
              <Button onClick={this.props.onSave}>
                Save {isConfig ? `Config` : `Settings`}
              </Button>
            </ButtonWrapper>
          )}
        </Wrapper>
      </Container>
    )
  }

  private handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 's' && e.metaKey) {
      e.preventDefault()
      this.props.onSave()
    }
  }
}
const playgroundSettingsSelector = createStructuredSelector({
  value: getSettingsString,
})

interface HOCProps {
  editSettings: () => void
  saveSettings: () => void
  onSave: (value: string) => void
}

// tslint:disable
class SettingsEditorHOC extends React.Component<
  Props & HOCProps,
  { value: string }
> {
  constructor(props) {
    super(props)
    this.state = { value: props.value }
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.props.value) {
      this.setState({ value: nextProps.value })
    }
  }
  render() {
    return (
      <SettingsEditor
        value={this.state.value}
        onChange={this.handleChange}
        onSave={this.handleSave}
      />
    )
  }
  handleChange = value => {
    this.setState({ value })
    this.props.editSettings()
  }
  handleSave = () => {
    this.props.onChange(this.state.value)
    this.props.saveSettings()
  }
}

export const PlaygroundSettingsEditor = connect(
  playgroundSettingsSelector,
  {
    onChange: setSettingsString,
    editSettings,
    saveSettings,
  },
)(SettingsEditorHOC)

const configSelector = createStructuredSelector({
  value: getConfigString,
})

export const GraphQLConfigEditor = connect(
  configSelector,
  {
    onChange: setConfigString,
  },
)(SettingsEditor)

const Wrapper = styled.div`
  background: ${p => p.theme.editorColours.resultBackground};
  position: relative;
  display: flex;
  flex-flow: column;
  flex: 1 1 0;

  .CodeMirror {
    background: ${p => p.theme.editorColours.resultBackground};
    .CodeMirror-code {
      color: rgba(255, 255, 255, 0.7);
    }
    .cm-atom {
      color: rgba(42, 126, 210, 1);
    }
  }
`

const ButtonWrapper = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 2;
`

const PlaygroundVersion = styled.span`
  position: absolute;
  right: 20px;
  bottom: 17px;
  color: ${p => p.theme.editorColours.textInactive};
  font-weight: 700;
  margin-right: 14px;
`
