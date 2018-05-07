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
  injectHeaders,
  schemaFetchingError,
  schemaFetchingSuccess,
} from '../state/sessions/actions'
import { setConfigString } from '../state/general/actions'
import { initState } from '../state/workspace/actions'
import { GraphQLSchema } from 'graphql'
import { createStructuredSelector } from 'reselect'
import {
  getIsConfigTab,
  getIsSettingsTab,
  getIsFile,
  getFile,
  getHeaders,
  getIsReloadingSchema,
} from '../state/sessions/selectors'
import { getHistoryOpen } from '../state/general/selectors'
import {
  setLinkCreator,
  schemaFetcher,
  setSubscriptionEndpoint,
} from '../state/sessions/fetchingSagas'
import { Session } from '../state/sessions/reducers'
import { getWorkspaceId } from './Playground/util/getWorkspaceId'
import { getSettings, getSettingsString } from '../state/workspace/reducers'
import { Backoff } from './Playground/util/fibonacci-backoff'

export interface Response {
  resultID: string
  date: string
  time: Date
}

export interface Props {
  endpoint: string
  subscriptionEndpoint?: string
  projectId?: string
  shareEnabled?: boolean
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
  config: GraphQLConfig
  configString: string
  configIsYaml: boolean
  canSaveConfig: boolean
  fixedEndpoints: boolean
  headers?: any
  configPath?: string
  createApolloLink?: (session: Session) => ApolloLink
  workspaceName?: string
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
  injectHeaders: (headers: string, endpoint: string) => void
  setConfigString: (str: string) => void
  schemaFetchingError: (endpoint: string, error: string) => void
  schemaFetchingSuccess: (endpoint: string, tracingSupported: boolean) => void
  isReloadingSchema: boolean
  isConfigTab: boolean
  isSettingsTab: boolean
  isFile: boolean
  historyOpen: boolean
  file: string
  sessionHeaders?: any
  settings: ISettings
  settingsString: string
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
  static defaultProps = {
    shareEnabled: true,
  }

  apolloLinks: { [sessionId: string]: any } = {}
  observers: { [sessionId: string]: any } = {}
  graphiqlComponents: any[] = []
  private backoff: Backoff
  private initialIndex: number = -1
  private mounted = false
  private fetchingSchema = false

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
    this.props.initState(getWorkspaceId(this.props), this.props.endpoint)
    this.props.setConfigString(this.props.configString)
    this.props.injectHeaders(this.props.headers, this.props.endpoint)
  }

  componentDidMount() {
    if (this.initialIndex > -1) {
      this.setState({
        selectedSessionIndex: this.initialIndex,
      } as State)
    }
    this.mounted = true
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.createApolloLink !== nextProps.createApolloLink) {
      setLinkCreator(nextProps.createApolloLink)
    }
    if (
      nextProps.headers !== this.props.headers ||
      nextProps.endpoint !== this.props.endpoint ||
      nextProps.workspaceName !== this.props.workspaceName ||
      nextProps.sessionHeaders !== this.props.sessionHeaders
    ) {
      this.getSchema(nextProps)
    }
    if (this.props.isReloadingSchema && !nextProps.isReloadingSchema) {
      setTimeout(() => {
        this.getSchema(nextProps)
      })
    }
    if (
      this.props.endpoint !== nextProps.endpoint ||
      this.props.configPath !== nextProps.configPath ||
      nextProps.workspaceName !== this.props.workspaceName
    ) {
      this.props.initState(getWorkspaceId(nextProps), nextProps.endpoint)
    }
    if (this.props.subscriptionEndpoint !== nextProps.subscriptionEndpoint) {
      setSubscriptionEndpoint(nextProps.subscriptionEndpoint)
    }
    if (nextProps.headers !== this.props.headers) {
      this.props.injectHeaders(nextProps.headers, nextProps.endpoint)
    }
    if (nextProps.configString !== this.props.configString) {
      this.props.setConfigString(nextProps.configString)
    }
  }

  async getSchema(props = this.props) {
    if (this.mounted && this.state.schema) {
      this.setState({ schema: undefined })
    }
    let first = true
    if (this.backoff) {
      this.backoff.stop()
    }
    this.backoff = new Backoff(async () => {
      if (first) {
        await this.schemaGetter(props)
        first = false
      } else {
        await this.schemaGetter()
      }
    })
    this.backoff.start()
  }

  async schemaGetter(props = this.props) {
    if (!this.fetchingSchema) {
      try {
        const data = {
          endpoint: props.endpoint,
          headers:
            props.sessionHeaders && props.sessionHeaders.length > 0
              ? props.sessionHeaders
              : JSON.stringify(props.headers),
        }
        const schema = await schemaFetcher.fetch(data)
        schemaFetcher.subscribe(data, newSchema => {
          if (data.endpoint === this.props.endpoint) {
            this.setState({ schema: newSchema })
          }
        })
        if (schema) {
          this.setState({ schema: schema.schema })
          this.props.schemaFetchingSuccess(
            props.endpoint,
            schema.tracingSupported,
          )
          this.backoff.stop()
        }
      } catch (e) {
        // tslint:disable-next-line
        console.error(e)
        this.props.schemaFetchingError(props.endpoint, e.message)
      }
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
              <GraphQLEditor
                shareEnabled={this.props.shareEnabled}
                schema={this.state.schema}
              />
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
  sessionHeaders: getHeaders,
  settings: getSettings,
  settingsString: getSettingsString,
  isReloadingSchema: getIsReloadingSchema,
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
  injectHeaders,
  setConfigString,
  schemaFetchingError,
  schemaFetchingSuccess,
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
