import * as React from 'react'
import { GraphQLEditor } from './Playground/GraphQLEditor'
import * as fetch from 'isomorphic-fetch'
import { TabBar } from './Playground/TabBar'
import { defaultQuery, getDefaultSession } from '../constants'
import { Session, ISettings, ApolloLinkExecuteResponse } from '../types'
import * as cuid from 'cuid'
import * as Immutable from 'seamless-immutable'
import PlaygroundStorage from './PlaygroundStorage'
import { getQueryTypes } from './Playground/util/getQueryTypes'
import debounce from 'graphiql/dist/utility/debounce'
import { SubscriptionClient } from 'subscriptions-transport-ws'
import hasSubscription from './Playground/util/hasSubscription'
import HistoryPopup from './HistoryPopup'
import * as cx from 'classnames'
import CodeGenerationPopup from './CodeGenerationPopup/CodeGenerationPopup'
import { connect } from 'react-redux'
import { DocsState } from '../reducers/graphiql-docs'
import GraphQLEditorSession from './Playground/GraphQLEditorSession'
import { setStacks } from '../actions/graphiql-docs'
import { mapValues } from 'lodash'
import { styled } from '../styled'
import { isSharingAuthorization } from './Playground/util/session'
import { SchemaFetcher } from './Playground/SchemaFetcher'
import Settings from './Settings'
import SettingsEditor from './SettingsEditor'
import { GraphQLConfig } from '../graphqlConfig'
import FileEditor from './FileEditor'
import { ApolloLink, execute, GraphQLRequest } from 'apollo-link'
import { WebSocketLink } from 'apollo-link-ws'
import { HttpLink } from 'apollo-link-http'

import * as app from '../../package.json'

export interface Response {
  resultID: string
  date: string
  time: Date
}

export interface Props {
  endpoint: string
  subscriptionsEndpoint?: string
  projectId?: string
  adminAuthToken?: string
  onSuccess?: (graphQLParams: any, response: any) => void
  isEndpoint?: boolean
  onboardingStep?: string
  tether?: any
  nextStep?: () => void
  isApp?: boolean
  onChangeEndpoint?: (endpoint: string) => void
  share: (state: any) => void
  shareUrl?: string
  session?: any
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
  createApolloLink?: (Session) => ApolloLink
}

export interface State {
  schema: any
  sessions: Session[]
  selectedSessionIndex: number
  schemaCache: any
  historyOpen: boolean
  history: Session[]
  adminAuthToken: string | null
  response?: Response
  selectUserSessionId?: string
  codeGenerationPopupOpen: boolean
  disableQueryHeader: boolean
  useVim: boolean
  userModelName: string

  shareAllTabs: boolean
  shareHttpHeaders: boolean
  shareHistory: boolean
  changed: boolean
  tracingSupported: boolean
}

export interface CursorPosition {
  line: number
  ch: number
}

export { GraphQLEditor }

export class Playground extends React.PureComponent<Props & DocsState, State> {
  storage: PlaygroundStorage
  apolloLinks: { [sessionId: string]: any } = {}
  observers: { [sessionId: string]: any } = {}
  graphiqlComponents: any[] = []
  private initialIndex: number = -1
  private schemaFetcher: SchemaFetcher

  private updateQueryTypes = debounce(
    150,
    (sessionId: string, query: string) => {
      const queryTypes = getQueryTypes(query)
      this.setValueInSession(sessionId, 'queryTypes', queryTypes)
    },
  )

  private handleQueryChange = debounce(
    300,
    (sessionId: string, query: string) => {
      this.setValueInSession(sessionId, 'query', query)
      this.setValueInSession(sessionId, 'hasChanged', true)
      this.updateQueryTypes(sessionId, query)
    },
  )

  constructor(props: Props & DocsState) {
    super(props)
    this.storage = new PlaygroundStorage(this.getStorageKey(props))
    if (props.session) {
      this.storage.setState(props.session, props.endpoint)
    }

    const sessions = this.initSessions(props)
    this.schemaFetcher = new SchemaFetcher()

    const selectedSessionIndex =
      parseInt(this.storage.getItem('selectedSessionIndex'), 10) || 0

    this.state = {
      schema: null,
      schemaCache: null,
      sessions,
      selectedSessionIndex:
        selectedSessionIndex < sessions.length && selectedSessionIndex > -1
          ? selectedSessionIndex
          : 0,
      historyOpen: false,
      history: this.storage.getHistory(),
      adminAuthToken:
        (props.adminAuthToken &&
          props.adminAuthToken.length > 0 &&
          props.adminAuthToken) ||
        localStorage.getItem('token'),
      selectUserSessionId: undefined,
      codeGenerationPopupOpen: false,
      disableQueryHeader: false,
      useVim: localStorage.getItem('useVim') === 'true' || false,
      shareAllTabs: true,
      shareHttpHeaders: true,
      shareHistory: true,
      changed: false,
      response: undefined,
      userModelName: 'User',
      tracingSupported: false,
    }

    if (typeof window === 'object') {
      window.addEventListener('beforeunload', () => {
        this.componentWillUnmount()
      })
    }
    ;(global as any).p = this
    this.fetcher = this.fetcher.bind(this)

    if (typeof this.props.getRef === 'function') {
      this.props.getRef(this)
    }
  }

  getStorageKey(props: Props = this.props) {
    // whenever possible, use the configPath as is more precise.
    // localhost:4000 could be used by multiple endpoints
    return props.configPath || props.endpoint
  }

  componentWillMount() {
    // look, if there is a session. if not, initiate one.
    this.initSessions()
  }

  componentDidMount() {
    if (this.initialIndex > -1) {
      this.setState({
        selectedSessionIndex: this.initialIndex,
      } as State)
    }
    if (
      ['STEP3_UNCOMMENT_DESCRIPTION', 'STEP3_OPEN_PLAYGROUND'].indexOf(
        this.props.onboardingStep || '',
      ) > -1
    ) {
      this.setCursor({ line: 3, ch: 6 })
    }
    this.initApolloLinks()
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (
      prevProps.endpoint !== this.props.endpoint ||
      prevProps.adminAuthToken !== this.props.adminAuthToken ||
      prevProps.subscriptionsEndpoint !== this.props.subscriptionsEndpoint
    ) {
      this.saveSessions()
      this.saveHistory()
      this.storage.setItem(
        'selectedSessionIndex',
        String(this.state.selectedSessionIndex),
      )
      this.storage.saveProject()
      const storageKey = this.getStorageKey()
      this.storage = new PlaygroundStorage(storageKey)
      const sessions = this.initSessions()
      const selectedSessionIndex =
        parseInt(this.storage.getItem('selectedSessionIndex'), 10) || 0
      this.setState(
        {
          sessions,
          history: this.storage.getHistory(),
          selectedSessionIndex,
        },
        () => {
          this.resetSubscriptions()
        },
      )
    }

    if (
      prevState.sessions.length !== this.state.sessions.length &&
      typeof this.props.onUpdateSessionCount === 'function'
    ) {
      this.props.onUpdateSessionCount()
    }
  }

  componentWillUnmount() {
    this.storage.setItem(
      'selectedSessionIndex',
      String(this.state.selectedSessionIndex),
    )
    this.saveSessions()
    this.saveHistory()
    this.storage.saveProject()
  }

  setApolloLink = (session: Session) => {
    if (this.apolloLinks[session.id]) {
      this.apolloLinks[session.id].unsubscribeAll()
    }

    this.apolloLinks[session.id] = this.createDefaultApolloLink(session)
  }

  initApolloLinks() {
    this.state.sessions.forEach(session => this.setApolloLink(session))
  }

  setCursor(position: CursorPosition) {
    if (this.graphiqlComponents) {
      const editor = this.graphiqlComponents[this.state.selectedSessionIndex]
      if (editor && editor.queryEditorComponent) {
        editor.queryEditorComponent.editor.setCursor(position)
      }
    }
  }

  render() {
    const { sessions, selectedSessionIndex } = this.state
    const { isEndpoint } = this.props
    const theme = this.props.settings['editor.theme']
    const selectedEndpointUrl = isEndpoint ? location.href : this.getEndpoint()
    const isGraphcoolUrl = this.isGraphcoolUrl(selectedEndpointUrl)
    const { version }: any = app

    window.version = version

    return (
      <PlaygroundWrapper className="playground">
        <TabBar
          sessions={sessions}
          selectedSessionIndex={selectedSessionIndex}
          onNewSession={this.handleNewSessionWithoutNewIndexZero}
          onCloseSession={this.handleCloseSession}
          onSelectSession={this.handleSelectSession}
          isApp={this.props.isApp}
        />
        <GraphiqlsContainer
          className={cx('graphiqls-container', {
            'docs-graphiql': theme === 'light',
          })}
        >
          {sessions.map((session, index) => (
            <GraphiqlWrapper
              key={session.id}
              className={cx('graphiql-wrapper', {
                active: index === selectedSessionIndex,
              })}
              style={{
                top: `-${100 * selectedSessionIndex}%`,
              }}
            >
              {session.isConfigTab ? (
                <SettingsEditor
                  value={this.props.configString}
                  onChange={this.handleChangeConfig}
                  onSave={this.handleSaveConfig}
                  isYaml={this.props.configIsYaml}
                  isConfig={true}
                  readOnly={!this.props.canSaveConfig}
                />
              ) : session.isSettingsTab ? (
                <SettingsEditor
                  value={this.props.settingsString}
                  onChange={this.handleChangeSettings}
                  onSave={this.handleSaveSettings}
                />
              ) : session.isFile && session.file ? (
                <FileEditor
                  value={session.file!}
                  onChange={this.handleFileChange}
                />
              ) : (
                <GraphQLEditorSession
                  key={session.id}
                  session={session}
                  index={index}
                  isGraphcoolUrl={isGraphcoolUrl}
                  fetcher={this.fetcher}
                  isEndpoint={Boolean(isEndpoint)}
                  endpoint={this.props.endpoint}
                  storage={this.storage.getSessionStorage(session.id)}
                  onClickCodeGeneration={this.handleClickCodeGeneration}
                  onEditOperationName={this.handleOperationNameChange}
                  onEditVariables={this.handleVariableChange}
                  onEditQuery={this.handleQueryChange}
                  onChangeHeaders={this.handleChangeHeaders}
                  onClickHistory={this.handleOpenHistory}
                  onChangeEndpoint={this.handleChangeEndpoint}
                  onClickShare={this.share}
                  responses={
                    this.state.response ? [this.state.response] : undefined
                  }
                  disableQueryHeader={this.state.disableQueryHeader}
                  onRef={this.setRef}
                  useVim={this.state.useVim && index === selectedSessionIndex}
                  isActive={index === selectedSessionIndex}
                  schemaFetcher={this.schemaFetcher}
                  fixedEndpoint={this.props.fixedEndpoints}
                  sharing={{
                    localTheme: this.props.settings['editor.theme'],
                    onShare: this.share,
                    onToggleHistory: this.toggleShareHistory,
                    onToggleAllTabs: this.toggleShareAllTabs,
                    onToggleHttpHeaders: this.toggleShareHTTPHeaders,
                    history: this.state.shareHistory,
                    allTabs: this.state.shareAllTabs,
                    httpHeaders: this.state.shareHttpHeaders,
                    shareUrl: this.props.shareUrl,
                    reshare: this.state.changed,
                    isSharingAuthorization: this.isSharingAuthorization(),
                  }}
                  settings={this.props.settings}
                />
              )}
            </GraphiqlWrapper>
          ))}
        </GraphiqlsContainer>
        <Settings onClick={this.openSettingsTab} />
        {this.state.historyOpen && this.renderHistoryPopup()}
        {this.state.codeGenerationPopupOpen && this.renderCodeGenerationPopup()}
      </PlaygroundWrapper>
    )
  }

  renderHistoryPopup() {
    const { sessions, selectedSessionIndex } = this.state
    const selectedSession = sessions[selectedSessionIndex]
    const historyItems = this.state.history.filter(
      s => s.endpoint === selectedSession.endpoint,
    )

    return (
      <HistoryPopup
        isOpen={this.state.historyOpen}
        onRequestClose={this.handleCloseHistory}
        historyItems={historyItems}
        onItemStarToggled={this.handleItemStarToggled}
        fetcherCreater={this.fetcher}
        onCreateSession={this.handleCreateSession}
        schemaFetcher={this.schemaFetcher}
      />
    )
  }

  renderCodeGenerationPopup() {
    const { sessions, selectedSessionIndex } = this.state
    const { isEndpoint } = this.props
    const selectedSession = sessions[selectedSessionIndex]
    const selectedEndpointUrl = isEndpoint ? location.href : this.getEndpoint()
    return (
      <CodeGenerationPopup
        endpointUrl={selectedEndpointUrl}
        isOpen={this.state.codeGenerationPopupOpen}
        onRequestClose={this.handleCloseCodeGeneration}
        query={selectedSession.query}
      />
    )
  }

  setRef = (index: number, ref: any) => {
    this.graphiqlComponents[index] = ref ? ref.getWrappedInstance() : ref
  }

  handleChangeSettings = (settings: string) => {
    const settingsSession = this.state.sessions.find(session =>
      Boolean(session.isSettingsTab),
    )
    if (settingsSession) {
      this.setValueInSession(settingsSession.id, 'hasChanged', true)
    }
    this.props.onChangeSettings(settings)
  }

  handleSaveSettings = () => {
    const settingsSession = this.state.sessions.find(session =>
      Boolean(session.isSettingsTab),
    )
    if (settingsSession) {
      this.setValueInSession(settingsSession.id, 'hasChanged', false)
    }
    this.props.onSaveSettings()
  }

  handleChangeConfig = (config: string) => {
    const configSession = this.state.sessions.find(session =>
      Boolean(session.isConfigTab),
    )
    if (configSession) {
      this.setValueInSession(configSession.id, 'hasChanged', true)
    }
    this.props.onChangeConfig(config)
  }

  handleSaveConfig = () => {
    const configSession = this.state.sessions.find(session =>
      Boolean(session.isConfigTab),
    )
    if (configSession) {
      this.setValueInSession(configSession.id, 'hasChanged', false)
    }
    this.props.onSaveConfig()
  }

  handleFileChange = file => {
    const session = this.state.sessions[this.state.selectedSessionIndex]
    this.setValueInSession(session.id, 'file', file)
    this.setValueInSession(session.id, 'hasChanged', true)
  }

  handleSaveFile = file => {
    const session = this.state.sessions[this.state.selectedSessionIndex]
    this.setValueInSession(session.id, 'hasChanged', false)
  }

  public reloadSchema = () => {
    if (this.graphiqlComponents) {
      const editor = this.graphiqlComponents[this.state.selectedSessionIndex]
      if (editor && editor.queryEditorComponent) {
        editor.reloadSchema()
      }
    }
  }

  public openSettingsTab = () => {
    const sessionIndex = this.state.sessions.findIndex(s =>
      Boolean(s.isSettingsTab),
    )
    if (sessionIndex === -1) {
      let session = this.createSession()
      session = Immutable.set(session, 'isSettingsTab', true)
      session = Immutable.set(session, 'isFile', true)
      session = Immutable.set(session, 'name', 'Settings')
      this.setState(state => {
        return {
          ...state,
          sessions: state.sessions.concat(session),
          selectedSessionIndex: state.sessions.length,
          changed: false,
        }
      })
    } else {
      this.setState({ selectedSessionIndex: sessionIndex })
    }
  }

  public openConfigTab = () => {
    const sessionIndex = this.state.sessions.findIndex(s =>
      Boolean(s.isConfigTab),
    )
    if (sessionIndex === -1) {
      let session = this.createSession()
      session = Immutable.set(session, 'isConfigTab', true)
      session = Immutable.set(session, 'isFile', true)
      session = Immutable.set(session, 'name', 'GraphQL Config')
      this.setState(state => {
        return {
          ...state,
          sessions: state.sessions.concat(session),
          selectedSessionIndex: state.sessions.length,
          changed: false,
        }
      })
    } else {
      this.setState({ selectedSessionIndex: sessionIndex })
    }
  }

  public newSession = (name?: string) => {
    let session = this.createSession()
    if (name) {
      session = Immutable.set(session, 'name', name)
    }
    this.setState(state => {
      return {
        ...state,
        sessions: state.sessions.concat(session),
        selectedSessionIndex: state.sessions.length,
        changed: true,
      }
    })
  }

  public newFileTab = (fileName: string, filePath: string, file: string) => {
    const sessionIndex = this.state.sessions.findIndex(s => s.name === fileName)
    if (sessionIndex === -1) {
      let session = this.createSession()
      session = Immutable.set(session, 'isFile', true)
      session = Immutable.set(session, 'name', fileName)
      session = Immutable.set(session, 'filePath', filePath)
      session = Immutable.set(session, 'file', file)
      this.setState(state => {
        return {
          ...state,
          sessions: state.sessions.concat(session),
          selectedSessionIndex: state.sessions.length,
          changed: false,
        }
      })
    } else {
      this.setState({ selectedSessionIndex: sessionIndex })
    }
  }

  public closeTab = () => {
    const { sessions, selectedSessionIndex } = this.state
    if (sessions.length > 1) {
      this.handleCloseSession(sessions[selectedSessionIndex])
      return true
    }
    return false
  }

  public nextTab = () => {
    const { sessions, selectedSessionIndex } = this.state
    const numberOfSessions = sessions.length

    if (numberOfSessions > 1) {
      this.setState(state => {
        return {
          ...state,
          selectedSessionIndex:
            selectedSessionIndex < numberOfSessions - 1
              ? selectedSessionIndex + 1
              : 0,
        }
      })
    }
  }

  public prevTab = () => {
    const { sessions, selectedSessionIndex } = this.state
    const numberOfSessions = sessions.length

    if (numberOfSessions > 1) {
      this.setState(state => {
        return {
          ...state,
          selectedSessionIndex:
            selectedSessionIndex > 0
              ? selectedSessionIndex - 1
              : numberOfSessions - 1,
        }
      })
    }
  }

  public switchTab = (index: number) => {
    const arrayIndex = index - 1
    const { sessions, selectedSessionIndex } = this.state
    const numberOfSessions = sessions.length

    if (arrayIndex !== selectedSessionIndex || arrayIndex <= numberOfSessions) {
      this.setState(state => {
        return {
          ...state,
          selectedSessionIndex: arrayIndex,
        }
      })
    }
  }

  public handleNewSession = (newIndexZero: boolean = false) => {
    const session = this.createSession()
    if (session.query === defaultQuery) {
      setTimeout(() => {
        this.setCursor({
          line: 1,
          ch: 0,
        })
      }, 5)
    }
    this.setState(state => {
      return {
        ...state,
        sessions: state.sessions.concat(session),
        selectedSessionIndex: newIndexZero ? 0 : state.sessions.length,
        changed: true,
      }
    })
  }
  public setValueInSession(
    sessionId: string,
    key: string,
    value: any,
    cb?: () => void,
  ) {
    this.setState(state => {
      // TODO optimize the lookup with a lookup table
      const i = state.sessions.findIndex(s => s.id === sessionId)
      return {
        ...state,
        sessions: Immutable.setIn(state.sessions, [i, key], value),
        changed: true,
      }
    })
    // hack to support older react versions
    setTimeout(() => {
      if (typeof cb === 'function') {
        cb()
      }
    }, 100)
  }

  // private toggleTheme = () => {
  //   this.setState(state => {
  //     const theme = state.theme === 'dark' ? 'light' : 'dark'
  //     localStorage.setItem('theme', theme)
  //     return { ...state, theme }
  //   })
  // }

  private handleClickCodeGeneration = () => {
    this.setState({
      codeGenerationPopupOpen: true,
    } as State)
  }

  private handleCloseCodeGeneration = () => {
    this.setState({ codeGenerationPopupOpen: false } as State)
  }

  private resetSubscriptions() {
    this.state.sessions.forEach(session => this.resetSubscription(session))
  }

  private resetSubscription(session: Session) {
    if (this.observers[session.id]) {
      this.observers[session.id].complete()
      delete this.observers[session.id]
    }
    this.cancelSubscription(session)
    this.setApolloLink(session)
  }

  private getUrlSession(sessions) {
    const prefix = '?query='
    if (location.search.includes(prefix)) {
      const uri = location.search.slice(prefix.length, location.search.length)
      const query = decodeURIComponent(uri)
      const equivalent = sessions.findIndex(
        session => session.query.trim() === query.trim(),
      )
      if (equivalent > -1) {
        this.initialIndex = equivalent
      } else {
        return this.createSessionFromQuery(query)
      }
    }

    return null
  }

  private handleCreateSession = (session: Session) => {
    const newSession = this.createSession(session)
    this.setState(state => {
      return {
        ...state,
        sessions: state.sessions.concat(newSession),
        selectedSessionIndex: state.sessions.length,
      }
    })
  }

  private handleItemStarToggled = (item: Session) => {
    this.setValueInHistory(item.id, 'starred', !item.starred)
  }

  private handleCloseSession = (session: Session) => {
    if (this.state.sessions.length === 1) {
      this.handleNewSession(true)
    }
    this.setState(state => {
      const i = state.sessions.findIndex(s => s.id === session.id)

      let nextSelectedSession = state.selectedSessionIndex
      if (nextSelectedSession > state.sessions.length - 2) {
        // if it's not the last session
        if (state.sessions.length > 1) {
          nextSelectedSession--
        }
      }
      return {
        ...state,
        sessions: [
          ...state.sessions.slice(0, i),
          ...state.sessions.slice(i + 1, state.sessions.length),
        ],
        selectedSessionIndex: nextSelectedSession,
        changed: true,
      }
    })

    this.storage.removeSession(session)
  }

  private handleOpenHistory = () => {
    this.setState({ historyOpen: true } as State)
  }

  private handleCloseHistory = () => {
    this.setState({ historyOpen: false } as State)
  }

  private handleSelectSession = (session: Session) => {
    this.setState(state => {
      const i = state.sessions.findIndex(s => s.id === session.id)

      if (
        this.props.onboardingStep === 'STEP3_SELECT_QUERY_TAB' &&
        i === 0 &&
        typeof this.props.nextStep === 'function'
      ) {
        this.props.nextStep()
      }
      return {
        ...state,
        selectedSessionIndex: i,
      }
    })
  }

  private handleChangeEndpoint = (sessionId: string, endpoint: string) => {
    this.setValueInSession(sessionId, 'endpoint', endpoint)
  }

  private initSessions = (props = this.props) => {
    // defaulting to admin for deserialized sessions
    const sessions = this.storage.getSessions() // .map(session => Immutable.set(session, 'selectedViewer', 'ADMIN'))

    const urlSession = this.getUrlSession(sessions)

    if (urlSession) {
      if (sessions.length === 1 && sessions[0].query === defaultQuery) {
        return [urlSession]
      }
      return sessions.concat(urlSession)
    }

    if (sessions.length > 0) {
      if (sessions.length === 1 && sessions[0].query === defaultQuery) {
        setTimeout(() => {
          this.setCursor({
            line: 1,
            ch: 0,
          })
        }, 5)
      }
      return sessions
    }

    return [this.createSession(undefined, props)]
  }

  private saveSessions = () => {
    this.state.sessions.forEach(session =>
      this.storage.saveSession(
        Immutable.set(session, 'subscriptionActive', false),
        false,
      ),
    )
  }

  private saveHistory = () => {
    this.storage.syncHistory(this.state.history)
  }

  private handleNewSessionWithoutNewIndexZero = () => {
    return this.handleNewSession(false)
  }

  private createSession = (session?: Session, props = this.props) => {
    let newSession
    const currentActiveSession =
      this.state && this.state.sessions[this.state.selectedSessionIndex]
    let headers
    if (props.headers && typeof props.headers === 'object') {
      headers = JSON.stringify(props.headers, null, 2)
    } else {
      headers =
        this.props.settings['editor.reuseHeaders'] && currentActiveSession
          ? currentActiveSession.headers
          : ''
    }
    if (session) {
      newSession = Immutable.set(session, 'id', cuid())
    } else {
      const query =
        this.storage.hasExecutedQuery() ||
        (this.state && this.state.sessions && this.state.sessions.length > 0)
          ? ''
          : defaultQuery

      newSession = Immutable({
        ...getDefaultSession(props.endpoint),
        query,
        headers,
      })
    }

    this.storage.saveSession(newSession)
    this.setApolloLink(newSession)
    return newSession
  }

  private createSessionFromQuery = (query: string) => {
    return Immutable(getDefaultSession(this.props.endpoint))
  }

  private handleChangeHeaders = (sessionId: string, headers: string) => {
    this.setValueInSession(sessionId, 'headers', headers)
  }

  private handleVariableChange = (sessionId: string, variables: string) => {
    this.setValueInSession(sessionId, 'variables', variables)
  }

  private handleOperationNameChange = (
    sessionId: string,
    operationName: string,
  ) => {
    this.setValueInSession(sessionId, 'operationName', operationName)
  }

  private setValueInHistory(sessionId: string, key: string, value: any) {
    this.setState(state => {
      // TODO optimize the lookup with a lookup table
      const i = state.history.findIndex(s => s.id === sessionId)
      return {
        ...state,
        history: Immutable.setIn(state.history, [i, key], value),
      }
    })
  }

  private isGraphcoolUrl(endpoint) {
    return endpoint.includes('api.graph.cool')
  }

  private getEndpoint() {
    if (this.props.isEndpoint) {
      return location.pathname
    }
    return this.props.endpoint
  }

  get httpApiPrefix() {
    return this.props.endpoint.match(/(https?:\/\/.*?)\/?/)![1]
  }

  private getWSEndpoint() {
    if (this.props.subscriptionsEndpoint) {
      return this.props.subscriptionsEndpoint
    }
    return null
  }

  private addToHistory(session: Session) {
    const id = cuid()
    const historySession = Immutable.merge(session, {
      id,
      date: new Date(),
    })
    this.setState(state => {
      return {
        ...state,
        history: [historySession].concat(state.history),
      }
    })
    this.storage.addToHistory(historySession)
  }

  private historyIncludes(session: Session) {
    const duplicate = this.state.history.find(
      item =>
        session.query === item.query &&
        session.variables === item.variables &&
        session.operationName === item.operationName,
    )
    return Boolean(duplicate)
  }

  private cancelSubscription = (session: Session) => {
    this.setValueInSession(session.id, 'subscriptionActive', false)
    if (session.subscriptionId) {
      if (this.apolloLinks[session.id]) {
        this.apolloLinks[session.id].unsubscribe(session.subscriptionId)
      }
      this.setValueInSession(session.id, 'subscriptionId', null)
    }
  }

  private createDefaultApolloLink = (session: Session): ApolloLink => {
    let connectionParams = {}
    if (session.headers) {
      connectionParams = { ...this.parseHeaders(session.headers) }
    }

    let endpoint = this.getWSEndpoint()
    if (endpoint === null) {
      endpoint = this.getEndpoint()
    }
    const subscriptionClient = new SubscriptionClient(endpoint, {
      timeout: 20000,
      connectionParams,
    })

    const httpLink = new HttpLink({
      uri: () => this.getEndpoint(),
      fetch,
      headers: session.headers,
    })

    const webSocketLink = new WebSocketLink(subscriptionClient)
    return ApolloLink.split(
      operation => hasSubscription(operation.query),
      webSocketLink,
      httpLink,
    )
  }

  private fetcher = (
    session: Session,
    graphqQLRequest: GraphQLRequest,
  ): ApolloLinkExecuteResponse => {
    return execute(this.apolloLinks[session.id], graphqQLRequest)
  }

  private parseHeaders(headers: string) {
    if (Array.isArray(headers)) {
      return headers.reduce((acc, header) => {
        return {
          ...acc,
          [header.name]: header.value,
        }
      }, {})
    } else if (typeof headers === 'object') {
      return headers
    }
    let jsonVariables

    try {
      jsonVariables =
        headers && headers.trim() !== '' ? JSON.parse(headers) : undefined
    } catch (error) {
      /* tslint:disable-next-line */
      console.error(`Headers are invalid JSON: ${error.message}.`)
    }

    if (typeof jsonVariables !== 'object') {
      /* tslint:disable-next-line */
      console.error('Headers are not a JSON object.')
    }

    return jsonVariables
  }

  private isSharingAuthorization = (): boolean => {
    const {
      sessions,
      shareHttpHeaders,
      shareAllTabs,
      selectedSessionIndex,
    } = this.state

    // if we're not sharing *any* headers, then just return false
    if (!shareHttpHeaders) {
      return false
    }

    let sharableSessions: Session[]

    if (!shareAllTabs) {
      const currentSession: Session = sessions[selectedSessionIndex]
      sharableSessions = [currentSession]
    } else {
      // all sessions
      sharableSessions = sessions
    }

    return isSharingAuthorization(sharableSessions)
  }

  // private toggleUseVim = () => {
  //   this.setState(
  //     state => ({ ...state, useVim: !state.useVim }),
  //     () => {
  //       localStorage.setItem('useVim', String(this.state.useVim))
  //     },
  //   )
  // }

  private toggleShareAllTabs = () => {
    this.setState(state => ({ ...state, shareAllTabs: !state.shareAllTabs }))
  }

  private toggleShareHTTPHeaders = () => {
    this.setState(state => ({
      ...state,
      shareHttpHeaders: !state.shareHttpHeaders,
    }))
  }

  private toggleShareHistory = () => {
    this.setState(state => ({ ...state, shareHistory: !state.shareHistory }))
  }

  private share = () => {
    this.saveSessions()
    this.saveHistory()
    this.storage.saveProject()
    let sharingProject: any = this.storage.project

    if (!this.state.shareHttpHeaders) {
      sharingProject = {
        ...sharingProject,
        sessions: mapValues(sharingProject.sessions, (session: Session) => {
          session.headers = ''
          return session
        }),
      }
    }

    if (!this.state.shareAllTabs) {
      const currentSession: Session = this.state.sessions[
        this.state.selectedSessionIndex
      ]
      sharingProject = {
        ...sharingProject,
        sessions: {
          [currentSession.id]: currentSession,
        },
      }
    }

    if (!this.state.shareHistory) {
      sharingProject = {
        ...sharingProject,
        history: [],
      }
    }

    this.props.share(sharingProject)
    this.setState({ changed: false })
  }
}

export default connect<any, any, Props>((state: any) => state.graphiqlDocs, {
  setStacks,
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
