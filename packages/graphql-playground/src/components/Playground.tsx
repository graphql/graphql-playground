import * as React from 'react'
import { GraphQLEditor } from './Playground/GraphQLEditor'
import * as fetch from 'isomorphic-fetch'
import { TabBar } from './Playground/TabBar'
import { defaultQuery, getDefaultSession } from '../constants'
import { Session } from '../types'
import * as cuid from 'cuid'
import * as Immutable from 'seamless-immutable'
import OldThemeProvider from './Theme/ThemeProvider'
import PlaygroundStorage from './PlaygroundStorage'
import { getQueryTypes } from './Playground/util/getQueryTypes'
import debounce from 'graphiql/dist/utility/debounce'
import { Observable } from 'rxjs/Observable'
import { SubscriptionClient } from 'subscriptions-transport-ws'
import isQuerySubscription from './Playground/util/isQuerySubscription'
import HistoryPopup from './HistoryPopup'
import * as cx from 'classnames'
import CodeGenerationPopup from './CodeGenerationPopup/CodeGenerationPopup'
import { connect } from 'react-redux'
import { DocsState } from '../reducers/graphiql-docs'
import GraphQLEditorSession from './Playground/GraphQLEditorSession'
import { setStacks } from '../actions/graphiql-docs'
import { mapValues } from 'lodash'
import Share from './Share'
import { styled, ThemeProvider, theme as styledTheme } from '../styled'
import { isSharingAuthorization } from './Playground/util/session'
import { SchemaFetcher } from './Playground/SchemaFetcher'

export type Theme = 'dark' | 'light'
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
  theme: Theme
  autoReloadSchema: boolean
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
  wsConnections: { [sessionId: string]: any } = {}
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
      this.storage.setState(props.session)
    }

    const sessions = this.initSessions()
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
      theme: (localStorage.getItem('theme') as Theme) || 'dark',
      autoReloadSchema: false,
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
    const multi = !props.graphqlConfig
    return multi ? 'multi' : props.endpoint
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
    this.initWebsockets()
  }

  componentDidUpdate(prevProps: Props) {
    if (
      prevProps.endpoint !== this.props.endpoint ||
      prevProps.adminAuthToken !== this.props.adminAuthToken ||
      prevProps.subscriptionsEndpoint !== this.props.subscriptionsEndpoint
    ) {
      this.saveSessions()
      this.saveHistory()
      this.storage.saveProject()
      this.storage = new PlaygroundStorage(this.getStorageKey())
      const sessions = this.initSessions()
      this.setState(
        {
          sessions,
          history: this.storage.getHistory(),
        },
        () => {
          this.resetSubscriptions()
        },
      )
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

  setWS = (session: Session) => {
    let connectionParams: any = {}

    if (session.headers) {
      connectionParams = { ...session.headers }
    }

    if (this.wsConnections[session.id]) {
      this.wsConnections[session.id].unsubscribeAll()
    }

    const endpoint = this.getWSEndpoint()
    if (endpoint) {
      try {
        this.wsConnections[session.id] = new SubscriptionClient(endpoint, {
          timeout: 20000,
          connectionParams,
        })
      } catch (e) {
        /* tslint:disable-next-line */
        console.error(e)
      }
    }
  }
  initWebsockets() {
    this.state.sessions.forEach(session => this.setWS(session))
  }
  setCursor(position: CursorPosition) {
    const editor = this.graphiqlComponents[this.state.selectedSessionIndex]
      .queryEditorComponent.editor
    editor.setCursor(position)
  }
  render() {
    const { sessions, selectedSessionIndex, theme } = this.state
    const { isEndpoint } = this.props
    const selectedEndpointUrl = isEndpoint ? location.href : this.getEndpoint()
    const isGraphcoolUrl = this.isGraphcoolUrl(selectedEndpointUrl)

    return (
      <ThemeProvider theme={{ ...styledTheme, mode: theme }}>
        <OldThemeProvider theme={this.state.theme}>
          <PlaygroundWrapper className="playground">
            <TabBar
              sessions={sessions}
              selectedSessionIndex={selectedSessionIndex}
              onNewSession={this.handleNewSessionWithoutNewIndexZero}
              onCloseSession={this.handleCloseSession}
              onOpenHistory={this.handleOpenHistory}
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
                  <GraphQLEditorSession
                    key={session.id}
                    session={session}
                    index={index}
                    schemaCache={this.state.schemaCache}
                    isGraphcoolUrl={isGraphcoolUrl}
                    fetcher={this.fetcher}
                    isEndpoint={Boolean(isEndpoint)}
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
                  />
                </GraphiqlWrapper>
              ))}
            </GraphiqlsContainer>
            {/*
            <Settings
              onToggleTheme={this.toggleTheme}
              localTheme={this.state.theme}
              autoReload={this.state.autoReloadSchema}
              onToggleReload={this.toggleSchemaReload}
              onReload={this.fetchSchemas}
              endpoint={this.props.endpoint}
              onChangeEndpoint={this.props.onChangeEndpoint}
              useVim={this.state.useVim}
              onToggleUseVim={this.toggleUseVim}
              subscriptionsEndpoint={this.props.subscriptionsEndpoint || ''}
              onChangeSubscriptionsEndpoint={
                this.props.onChangeSubscriptionsEndpoint
              }
            />
            */}
            <Share
              localTheme={this.state.theme}
              onShare={this.share}
              onToggleHistory={this.toggleShareHistory}
              onToggleAllTabs={this.toggleShareAllTabs}
              onToggleHttpHeaders={this.toggleShareHTTPHeaders}
              history={this.state.shareHistory}
              allTabs={this.state.shareAllTabs}
              httpHeaders={this.state.shareHttpHeaders}
              shareUrl={this.props.shareUrl}
              reshare={this.state.changed}
              isSharingAuthorization={this.isSharingAuthorization()}
            />
            {this.state.historyOpen && this.renderHistoryPopup()}
            {this.state.codeGenerationPopupOpen &&
              this.renderCodeGenerationPopup()}
          </PlaygroundWrapper>
        </OldThemeProvider>
      </ThemeProvider>
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
    this.graphiqlComponents[index] = ref
  }

  toggleSchemaReload = () => {
    this.setState(state => ({
      ...state,
      autoReloadSchema: !state.autoReloadSchema,
    }))
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
    this.setWS(session)
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

  private initSessions = () => {
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

    return [this.createSession()]
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

  private createSession = (session?: Session) => {
    let newSession
    const currentActiveSession =
      this.state && this.state.sessions[this.state.selectedSessionIndex]
    const headers = currentActiveSession ? currentActiveSession.headers : []
    if (session) {
      newSession = Immutable.set(session, 'id', cuid())
    } else {
      const query =
        this.storage.hasExecutedQuery() ||
        (this.state && this.state.sessions && this.state.sessions.length > 0)
          ? ''
          : defaultQuery

      newSession = Immutable({
        ...getDefaultSession(this.props.endpoint),
        query,
        headers,
      })
    }

    this.storage.saveSession(newSession)
    return newSession
  }

  private createSessionFromQuery = (query: string) => {
    return Immutable(getDefaultSession(this.props.endpoint))
  }

  private handleChangeHeaders = (sessionId: string, headers: any[]) => {
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
      if (this.wsConnections[session.id]) {
        this.wsConnections[session.id].unsubscribe(session.subscriptionId)
      }
      this.setValueInSession(session.id, 'subscriptionId', null)
    }
  }

  private fetcher = (session: Session, graphQLParams, requestHeaders?: any) => {
    const { query, operationName } = graphQLParams

    if (!query.includes('IntrospectionQuery')) {
      if (!this.historyIncludes(session)) {
        setImmediate(() => {
          this.addToHistory(session)
        })
      }

      if (isQuerySubscription(query, operationName)) {
        /* tslint:disable-next-line */
        return Observable.create(observer => {
          this.observers[session.id] = observer
          if (!session.subscriptionActive) {
            this.setValueInSession(session.id, 'subscriptionActive', true)
          }

          const wsConnection = this.wsConnections[session.id]

          const id = wsConnection.subscribe(graphQLParams, (err, res) => {
            const data: any = { data: res, isSubscription: true }
            if (err) {
              data.error = err
            }
            observer.next(data)
          })

          this.setValueInSession(session.id, 'subscriptionId', id)
          return () => {
            this.cancelSubscription(session)
          }
        })
      }
    }

    const endpoint = this.getEndpoint()

    let headers: any = {
      'Content-Type': 'application/json',
    }

    if (session.headers) {
      headers = { ...headers, ...session.headers }
    }

    if (requestHeaders) {
      headers = { ...headers, ...requestHeaders }
    }

    return fetch(endpoint, {
      // tslint:disable-line
      method: 'post',
      headers,
      // credentials: 'include',
      body: JSON.stringify(graphQLParams),
    }).then(response => {
      if (typeof this.props.onSuccess === 'function') {
        this.props.onSuccess(graphQLParams, response)
      }
      if (this.props.isEndpoint) {
        history.pushState(
          {},
          'Graphcool Playground',
          `?query=${encodeURIComponent(query)}`,
        )
      }
      this.storage.executedQuery()
      return response.json()
    })
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
          session.headers = {}
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

export default connect<any, any, Props>(state => state.graphiqlDocs, {
  setStacks,
})(Playground)

const PlaygroundWrapper = styled.div`
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
`
