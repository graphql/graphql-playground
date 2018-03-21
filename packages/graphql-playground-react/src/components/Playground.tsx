import * as React from 'react'
import GraphQLEditor from './Playground/GraphQLEditor'
import TabBar from './Playground/TabBar'
import { ISettings } from '../types'
import HistoryPopup from './HistoryPopup'
import * as cx from 'classnames'
import { styled } from '../styled'
import Settings from './Settings'
import { PlaygroundSettingsEditor, GraphQLConfigEditor } from './SettingsEditor'
import { GraphQLConfig } from '../graphqlConfig'
import FileEditor from './FileEditor'
import { ApolloLink } from 'apollo-link'

import * as app from '../../package.json'
import { connect } from 'react-redux'
import {
  selectTabIndex,
  selectNextTab,
  selectPrevTab,
  newSession,
  closeSelectedTab,
  saveSettings,
  saveConfig,
  setTracingSupported,
} from '../state/sessions/actions'
import { initState } from '../state/workspace/actions'
import { GraphQLSchema } from 'graphql'
import { createStructuredSelector } from 'reselect'
import {
  getIsConfigTab,
  getIsSettingsTab,
  getIsFile,
  getFile,
  getHeaders,
} from '../state/sessions/selectors'
import { getHistoryOpen } from '../state/general/selectors'
import {
  setLinkCreator,
  schemaFetcher,
  setSubscriptionEndpoint,
} from '../state/sessions/fetchingSagas'
import { Session } from '../state/sessions/reducers'

export interface Response {
  resultID: string
  date: string
  time: Date
}

export interface Props {
  endpoint: string
  subscriptionEndpoint?: string
  projectId?: string
  adminAuthToken?: string
  onSuccess?: (graphQLParams: any, response: any) => void
  isEndpoint?: boolean
  isApp?: boolean
  onChangeEndpoint?: (endpoint: string) => void
  share: (state: any) => void
  shareUrl?: string
  onChangeSubscriptionsEndpoint?: (endpoint: string) => void
  getRef?: (ref: Playground) => void
  graphqlConfig?: any
  onSaveSettings: () => void
  onChangeSettings: (settingsString: string) => void
  onSaveConfig: () => void
  onChangeConfig: (configString: string) => void
  onUpdateSessionCount?: () => void
  settings: ISettings
  settingsString: string
  config: GraphQLConfig
  configString: string
  configIsYaml: boolean
  canSaveConfig: boolean
  fixedEndpoints: boolean
  headers?: any
  configPath?: string
  createApolloLink?: (session: Session) => ApolloLink
}

export interface ReduxProps {
  selectTabIndex: (index: number) => void
  selectNextTab: () => void
  selectPrevTab: () => void
  closeSelectedTab: () => void
  newSession: (endpoint: string, reuseHeaders: boolean) => void
  initState: (workspaceId: string, endpoint: string) => void
  saveConfig: () => void
  saveSettings: () => void
  setTracingSupported: (value: boolean) => void
  isConfigTab: boolean
  isSettingsTab: boolean
  isFile: boolean
  historyOpen: boolean
  file: string
}

export interface State {
  schema?: GraphQLSchema
}

export interface CursorPosition {
  line: number
  ch: number
}

export { GraphQLEditor }

export class Playground extends React.PureComponent<Props & ReduxProps, State> {
  apolloLinks: { [sessionId: string]: any } = {}
  observers: { [sessionId: string]: any } = {}
  graphiqlComponents: any[] = []
  private initialIndex: number = -1

  constructor(props: Props & ReduxProps) {
    super(props)

    this.state = {
      schema: undefined,
    }
    ;(global as any).p = this

    if (typeof this.props.getRef === 'function') {
      this.props.getRef(this)
    }

    setLinkCreator(props.createApolloLink)
    this.getSchema()
    setSubscriptionEndpoint(props.subscriptionEndpoint)
  }

  componentWillMount() {
    // init redux
    this.props.initState(this.props.endpoint, this.getWorkspaceId())
  }

  componentDidMount() {
    if (this.initialIndex > -1) {
      this.setState({
        selectedSessionIndex: this.initialIndex,
      } as State)
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.createApolloLink !== nextProps.createApolloLink) {
      setLinkCreator(nextProps.createApolloLink)
    }
    if (
      nextProps.headers !== this.props.headers ||
      nextProps.endpoint !== this.props.endpoint
    ) {
      this.getSchema()
    }
    if (
      this.props.endpoint !== nextProps.endpoint ||
      this.props.configPath !== nextProps.configPath
    ) {
      this.props.initState(nextProps.endpoint, this.getWorkspaceId(nextProps))
    }
    if (this.props.subscriptionEndpoint !== nextProps.subscriptionEndpoint) {
      setSubscriptionEndpoint(nextProps.subscriptionEndpoint)
    }
  }

  getWorkspaceId(props = this.props) {
    const configPathString = props.configPath ? `${props.configPath}~` : ''
    return `${configPathString}${props.endpoint}`
  }

  async getSchema() {
    const schema = await schemaFetcher.fetch({
      endpoint: this.props.endpoint,
      headers: this.props.headers,
    })
    if (schema) {
      this.setState({ schema: schema.schema })
      this.props.setTracingSupported(schema.tracingSupported)
    }
  }

  render() {
    const theme = this.props.settings['editor.theme']
    const { version }: any = app

    window.version = version

    return (
      <PlaygroundWrapper className="playground">
        <TabBar onNewSession={this.createSession} isApp={this.props.isApp} />
        <GraphiqlsContainer
          className={cx('graphiqls-container', {
            'docs-graphiql': theme === 'light',
          })}
        >
          <GraphiqlWrapper className="graphiql-wrapper active">
            {this.props.isConfigTab ? (
              <GraphQLConfigEditor
                onSave={this.handleSaveConfig}
                isYaml={this.props.configIsYaml}
                isConfig={true}
                readOnly={!this.props.canSaveConfig}
              />
            ) : this.props.isSettingsTab ? (
              <PlaygroundSettingsEditor onSave={this.handleSaveSettings} />
            ) : this.props.isFile && this.props.file ? (
              <FileEditor />
            ) : (
              <GraphQLEditor schema={this.state.schema} />
            )}
          </GraphiqlWrapper>
        </GraphiqlsContainer>
        <Settings />
        {this.props.historyOpen && this.renderHistoryPopup()}
      </PlaygroundWrapper>
    )
  }

  renderHistoryPopup() {
    return <HistoryPopup />
  }

  setRef = (index: number, ref: any) => {
    this.graphiqlComponents[index] = ref ? ref.getWrappedInstance() : ref
  }

  public closeTab = () => {
    this.props.closeSelectedTab()
  }

  public nextTab = () => {
    this.props.selectNextTab()
  }

  public prevTab = () => {
    this.props.selectPrevTab()
  }

  public switchTab = (index: number) => {
    this.props.selectTabIndex(index)
  }

  handleSaveConfig = () => {
    this.props.saveConfig()
    this.props.onSaveConfig()
  }

  handleSaveSettings = () => {
    this.props.saveSettings()
    this.props.onSaveSettings()
  }

  private createSession = () => {
    this.props.newSession(
      this.props.endpoint,
      this.props.settings['editor.reuseHeaders'],
    )
  }

  get httpApiPrefix() {
    return this.props.endpoint.match(/(https?:\/\/.*?)\/?/)![1]
  }
}

const mapStateToProps = createStructuredSelector({
  isConfigTab: getIsConfigTab,
  isSettingsTab: getIsSettingsTab,
  isFile: getIsFile,
  historyOpen: getHistoryOpen,
  file: getFile,
  headers: getHeaders,
})

export default connect(mapStateToProps, {
  selectTabIndex,
  selectNextTab,
  selectPrevTab,
  newSession,
  closeSelectedTab,
  initState,
  saveSettings,
  saveConfig,
  setTracingSupported,
})(Playground)

const PlaygroundWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;

  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  margin-right: -1px !important;

  line-height: 1.5;
  font-family: 'Open Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  letter-spacing: 0.53px;
  color: rgba(0, 0, 0, 0.8);

  a:active,
  a:focus,
  button:focus,
  input:focus {
    outline: none;
  }
`

const GraphiqlsContainer = styled.div`
  height: calc(100vh - 57px);
  position: relative;
  overflow: hidden;
`

const GraphiqlWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  visibility: hidden;
  &.active {
    visibility: visible;
  }
`
