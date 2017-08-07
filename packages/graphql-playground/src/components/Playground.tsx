import * as React from 'react'
import { GraphQLEditor } from './Playground/GraphQLEditor'
import * as fetch from 'isomorphic-fetch'
import { buildClientSchema } from 'graphql'
import { TabBar } from './Playground/TabBar'
import { introspectionQuery, defaultQuery } from '../constants'
import { Session } from '../types'
import * as cuid from 'cuid'
import * as Immutable from 'seamless-immutable'
import PlaygroundStorage from './PlaygroundStorage'
import getQueryTypes from './Playground/util/getQueryTypes'
import debounce from 'graphiql/dist/utility/debounce'
import { Observable } from 'rxjs/Observable'
import { SubscriptionClient } from 'subscriptions-transport-ws'
import isQuerySubscription from './Playground/util/isQuerySubscription'
import HistoryPopup from './HistoryPopup'
import * as cx from 'classnames'
import SelectUserPopup from './SelectUserPopup'
import calc from 'calculate-size'
import { CodeGenerationPopup } from './CodeGenerationPopup/CodeGenerationPopup'
import { GraphQLObjectType, GraphQLList } from 'graphql'
import GraphDocs from './Playground/DocExplorer/GraphDocs'
import {
  onboardingEmptyMutation,
  onboardingFilledMutation1,
  onboardingFilledMutation2,
  onboardingQuery1,
  onboardingQuery1Check,
} from '../data'
import withTheme from './Theme/withTheme'

export type Theme = 'dark' | 'light'
export type Viewer = 'ADMIN' | 'EVERYONE' | 'USER'
export interface Response {
  date: string
  time: Date
}

export interface Props {
  theme?: Theme
  endpoint: string
  subscriptionsEndpoint?: string
  projectId?: string
  adminAuthToken?: string
  httpApiPrefix?: string
  wsApiPrefix?: string
  onSuccess?: (graphQLParams: any, response: any) => void
  isEndpoint?: boolean
  onboardingStep?: string
  tether?: any
  nextStep?: () => void
}

export interface State {
  schema: any
  sessions: Session[]
  selectedSessionIndex: number
  schemaCache: any
  historyOpen: boolean
  history: Session[]
  httpApiPrefix: string
  wsApiPrefix: string
  adminAuthToken?: string
  response?: Response
  selectUserOpen: boolean
  userFields: string[]
  selectUserSessionId?: string
  codeGenerationPopupOpen: boolean
  disableQueryHeader: boolean
}

export interface CursorPosition {
  line: number
  ch: number
}

const httpApiPrefix = 'https://api.graph.cool'
const wsApiPrefix = 'wss://dev.subscriptions.graph.cool/v1'

export { GraphQLEditor }

class Playground extends React.Component<Props, State> {
  storage: PlaygroundStorage
  wsConnections: { [sessionId: string]: any } = {}
  observers: { [sessionId: string]: any } = {}
  graphiqlComponents: any[] = []
  private initialIndex: number = -1

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
      this.updateQueryTypes(sessionId, query)
      if (
        this.props.onboardingStep === 'STEP3_UNCOMMENT_DESCRIPTION' &&
        this.state.selectedSessionIndex === 0
      ) {
        const trimmedQuery = query.replace(/\s/g, '').replace(',', '')
        if (
          trimmedQuery === onboardingQuery1Check &&
          typeof this.props.nextStep === 'function'
        ) {
          this.props.nextStep()
        }
      }

      if (
        (this.props.onboardingStep === 'STEP3_ENTER_MUTATION1_VALUES' ||
          this.props.onboardingStep === 'STEP3_ENTER_MUTATION2_VALUE') &&
        this.state.selectedSessionIndex === 1
      ) {
        const trimmedTemplate = onboardingEmptyMutation.replace(/\s/g, '')
        const trimmedQuery = query.replace(/\s/g, '').replace(',', '')
        if (
          trimmedQuery !== trimmedTemplate &&
          typeof this.props.nextStep === 'function'
        ) {
          this.props.nextStep()
        }
      }
    },
  )

  constructor(props) {
    super(props)
    this.storage = new PlaygroundStorage(props.endpoint)

    const sessions = this.initSessions()

    const selectedSessionIndex =
      parseInt(this.storage.getItem('selectedSessionIndex'), 10) || 0
    this.state = {
      schema: null,
      schemaCache: null,
      userFields: [],
      sessions,
      selectedSessionIndex:
        selectedSessionIndex < sessions.length && selectedSessionIndex > -1
          ? selectedSessionIndex
          : 0,
      historyOpen: false,
      history: this.storage.getHistory(),
      httpApiPrefix: props.httpApiPrefix || httpApiPrefix,
      wsApiPrefix: props.wsApiPrefix || wsApiPrefix,
      adminAuthToken:
        (props.adminAuthToken &&
          props.adminAuthToken.length > 0 &&
          props.adminAuthToken) ||
        localStorage.getItem('token'),
      response: undefined,
      selectUserOpen: false,
      selectUserSessionId: undefined,
      codeGenerationPopupOpen: false,
      disableQueryHeader: false,
    }

    if (typeof window === 'object') {
      window.addEventListener('beforeunload', () => {
        this.componentWillUnmount()
      })
    }
    ;(global as any).p = this
  }

  componentWillMount() {
    // look, if there is a session. if not, initiate one.
    this.fetchSchemas().then(this.initSessions)
  }

  componentDidMount() {
    if (this.initialIndex > -1) {
      this.setState(
        {
          selectedSessionIndex: this.initialIndex,
        } as State,
      )
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

  componentDidUpdate(prevProps) {
    if (
      prevProps.endpoint !== this.props.endpoint ||
      prevProps.adminAuthToken !== this.props.adminAuthToken
    ) {
      this.saveSessions()
      this.saveHistory()
      this.storage.saveProject()
      this.storage = new PlaygroundStorage(this.props.endpoint)
      const sessions = this.initSessions()
      this.setState({
        sessions,
        history: this.storage.getHistory(),
      })
      this.resetSubscriptions()
      this.fetchSchemas().then(this.initSessions)
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
    const connectionParams: any = {}

    if (session.headers) {
      session.headers.forEach(header => {
        connectionParams[header.name] = header.value
      })
    }

    if (session.selectedViewer === 'ADMIN' && this.state.adminAuthToken) {
      connectionParams.Authorization = `Bearer ${this.state.adminAuthToken}`
    } else if (session.selectedViewer === 'USER' && session.selectedUserToken) {
      connectionParams.Authorization = `Bearer ${session.selectedUserToken}`
    }

    if (this.wsConnections[session.id]) {
      this.wsConnections[session.id].unsubscribeAll()
    }
    this.wsConnections[
      session.id
    ] = new SubscriptionClient(this.getWSEndpoint(), {
      timeout: 20000,
      connectionParams,
    })
  }
  initWebsockets() {
    this.state.sessions.forEach(session => this.setWS(session))
  }
  setCursor(position: CursorPosition) {
    const editor = this.graphiqlComponents[this.state.selectedSessionIndex]
      .queryEditorComponent.editor
    editor.setCursor(position)
  }
  fetchSchemas() {
    return this.fetchSchema(this.getSimpleEndpoint()).then(simpleSchemaData => {
      if (!simpleSchemaData || simpleSchemaData.error) {
        this.setState(
          {
            response: {
              date: simpleSchemaData.error,
              time: new Date(),
            },
          } as State,
        )
        return
      }

      const simpleSchema = buildClientSchema(simpleSchemaData.data)

      const userFields = this.extractUserField(simpleSchema)

      this.setState(
        {
          schemaCache: simpleSchema,
          userFields,
        } as State,
      )
    })
  }
  extractUserField(simpleSchema) {
    const userSchema = simpleSchema.getType('User')
    if (userSchema) {
      const userSchemaFields = userSchema.getFields()
      const userFields = Object.keys(userSchemaFields)
        .map(fieldName => userSchemaFields[fieldName])
        .filter(field => {
          // filter password, meta fields and relation fields
          return (
            field.name[0] !== '_' &&
            field.name !== 'password' &&
            !(
              field.type instanceof GraphQLList ||
              field.type instanceof GraphQLObjectType
            )
          )
        })

      // put id to beginning
      userFields.sort((a, b) => {
        if (a.name === 'id') {
          return -1
        }
        if (b.name === 'id') {
          return 1
        }

        return a.name > b.name ? 1 : -1
      })

      return userFields.map(field => {
        const size = calc(field.name, {
          font: 'Open Sans',
          fontWeight: '600',
          fontSize: '16px',
        })
        let width = size.width
        if (field.name === 'id') {
          width = 220
        }
        // TODO create type to field width map
        field.width = Math.max(width, 185) + 50

        return field
      })
    } else {
      return []
    }
  }
  fetchSchema(endpointUrl: string) {
    return fetch(endpointUrl, {
      // tslint:disable-line
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'x-graphcool-source': 'console:playground',
      },
      body: JSON.stringify({ query: introspectionQuery }),
    }).then(response => {
      return response.json()
    })
  }
  render() {
    const { sessions, selectedSessionIndex } = this.state
    const { isEndpoint, theme } = this.props
    // {
    //   'blur': this.state.historyOpen,
    // },
    if (this.state.selectUserOpen && !this.props.adminAuthToken) {
      throw new Error(
        'The "Select User" Popup is open, but no admin token is provided.',
      )
    }
    const selectedSession = sessions[selectedSessionIndex]
    const selectedEndpointUrl = isEndpoint
      ? location.href
      : this.getSimpleEndpoint()
    // const canSelectUsers = this.state.userFields.length > 0
    const isGraphcoolUrl = this.isGraphcoolUrl(selectedEndpointUrl)
    return (
      <div className={cx('root')}>
        <style jsx={true}>{`
          .root {
            @p: .h100, .flex, .flexColumn;
          }

          .blur {
            filter: blur(5px);
          }

          .graphiqls-container {
            @p: .relative, .overflowHidden;
            height: calc(100vh - 57px);
          }

          .graphiql-wrapper {
            @p: .w100, .h100, .relative;
          }
        `}</style>
        <TabBar
          sessions={sessions}
          selectedSessionIndex={selectedSessionIndex}
          onNewSession={() => this.handleNewSession(false)}
          onCloseSession={this.handleCloseSession}
          onOpenHistory={this.handleOpenHistory}
          onSelectSession={this.handleSelectSession}
          onboardingStep={this.props.onboardingStep}
          nextStep={this.props.nextStep}
          tether={this.props.tether}
        />
        <div
          className={cx('graphiqls-container', {
            'docs-graphiql': theme === 'light',
          })}
        >
          {sessions.map((session, index) =>
            <div
              key={session.id}
              className={cx('graphiql-wrapper', {
                active: index === selectedSessionIndex,
              })}
              style={{
                top: `-${100 * selectedSessionIndex}%`,
              }}
            >
              <GraphQLEditor
                key={session.id}
                isGraphcoolUrl={isGraphcoolUrl}
                schema={this.state.schemaCache}
                fetcher={this.fetcher(session)}
                showQueryTitle={false}
                showResponseTitle={false}
                showViewAs={!isEndpoint && Boolean(this.props.adminAuthToken)}
                showSelectUser={Boolean(this.props.adminAuthToken)}
                showEndpoints={!isEndpoint}
                showDownloadJsonButton={true}
                showCodeGeneration={true}
                selectedViewer={session.selectedViewer}
                storage={this.storage.getSessionStorage(session.id)}
                query={session.query}
                variables={session.variables}
                operationName={session.operationName}
                headers={session.headers}
                onClickCodeGeneration={() => this.handleClickCodeGeneration()}
                onChangeViewer={(viewer: Viewer) =>
                  this.handleViewerChange(session.id, viewer)}
                onEditOperationName={(name: string) =>
                  this.handleOperationNameChange(session.id, name)}
                onEditVariables={(variables: string) =>
                  this.handleVariableChange(session.id, variables)}
                onEditQuery={(query: string) =>
                  this.handleQueryChange(session.id, query)}
                onChangeHeaders={(headers: any[]) =>
                  this.handleChangeHeaders(session.id, headers)}
                responses={
                  this.state.response ? [this.state.response] : undefined
                }
                disableQueryHeader={this.state.disableQueryHeader}
                disableResize={true}
                onboardingStep={
                  index === selectedSessionIndex
                    ? this.props.onboardingStep
                    : undefined
                }
                tether={this.props.tether}
                nextStep={this.props.nextStep}
                ref={ref => (this.graphiqlComponents[index] = ref)}
                autofillMutation={this.autofillMutation}
                rerenderQuery={
                  this.props.onboardingStep ===
                    'STEP3_ENTER_MUTATION1_VALUES' ||
                  this.props.onboardingStep === 'STEP3_ENTER_MUTATION2_VALUE'
                }
                disableAnimation={true}
              />
            </div>,
          )}
        </div>
        <GraphDocs schema={this.state.schemaCache} />
        {this.state.historyOpen &&
          <HistoryPopup
            isOpen={this.state.historyOpen}
            onRequestClose={this.handleCloseHistory}
            historyItems={this.state.history}
            onItemStarToggled={this.handleItemStarToggled}
            fetcherCreater={this.fetcher}
            schema={this.state.schemaCache}
            onCreateSession={this.handleCreateSession}
          />}
        {this.props.adminAuthToken &&
          <SelectUserPopup
            isOpen={this.state.selectUserOpen}
            onRequestClose={this.handleCloseSelectUser}
            adminAuthToken={this.props.adminAuthToken}
            userFields={this.state.userFields}
            onSelectUser={this.handleUserSelection}
            endpointUrl={this.getSimpleEndpoint()}
          />}
        {this.state.codeGenerationPopupOpen &&
          <CodeGenerationPopup
            endpointUrl={selectedEndpointUrl}
            isOpen={this.state.codeGenerationPopupOpen}
            onRequestClose={this.handleCloseCodeGeneration}
            query={selectedSession.query}
          />}
      </div>
    )
  }

  private autofillMutation = () => {
    const sessionId = this.state.sessions[this.state.selectedSessionIndex].id
    if (this.props.onboardingStep === 'STEP3_ENTER_MUTATION1_VALUES') {
      this.setValueInSession(sessionId, 'query', onboardingFilledMutation1)
    } else if (this.props.onboardingStep === 'STEP3_ENTER_MUTATION2_VALUE') {
      this.setValueInSession(sessionId, 'query', onboardingFilledMutation2)
    }
    if (typeof this.props.nextStep === 'function') {
      this.props.nextStep()
    }
  }

  private handleClickCodeGeneration = () => {
    this.setState(
      {
        codeGenerationPopupOpen: true,
      } as State,
    )
  }

  private handleCloseCodeGeneration = () => {
    this.setState({ codeGenerationPopupOpen: false } as State)
  }

  private handleUserSelection = user => {
    const systemApi = this.getSystemEndpoint()

    const query = `
      mutation {
        signinClientUser(input: {
          projectId: "${this.props.projectId}"
          clientUserId: "${user.id}"
          clientMutationId: "asd"
        }) {
          token
          clientMutationId
        }
      }
    `

    fetch(systemApi, {
      method: 'post',
      body: JSON.stringify({ query }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.state.adminAuthToken}`,
      },
    })
      .then(res => res.json())
      .then(res => {
        const { token } = res.data.signinClientUser

        if (token && this.state.selectUserSessionId) {
          this.setValueInSession(
            this.state.selectUserSessionId,
            'selectedUserToken',
            token,
            () => {
              const session = this.state.sessions[
                this.state.selectedSessionIndex
              ]
              this.resetSubscription(session)
            },
          )
        }
      })
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

  private initSessions = () => {
    if (
      ['STEP3_UNCOMMENT_DESCRIPTION', 'STEP3_OPEN_PLAYGROUND'].indexOf(
        this.props.onboardingStep || '',
      ) > -1
    ) {
      return this.initOnboardingSessions()
    }
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
      return sessions
    }

    return [this.createSession()]
  }

  private initOnboardingSessions() {
    const session = this.createSession()

    return [
      {
        ...session,
        query: onboardingQuery1,
      },
    ]
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

  private handleNewSession = (newIndexZero: boolean = false) => {
    let session = this.createSession()
    if (this.props.onboardingStep === 'STEP3_CREATE_MUTATION_TAB') {
      session = Immutable.set(session, 'query', onboardingEmptyMutation)
      setTimeout(() => {
        this.setCursor({
          line: 2,
          ch: 15,
        })
      }, 5)
      if (typeof this.props.nextStep === 'function') {
        this.props.nextStep()
      }
    }
    this.setState(state => {
      return {
        ...state,
        sessions: state.sessions.concat(session),
        selectedSessionIndex: newIndexZero ? 0 : state.sessions.length,
      }
    })
  }

  private createSession = (session?: Session) => {
    let newSession
    if (session) {
      newSession = Immutable.set(session, 'id', cuid())
    } else {
      const query = this.storage.hasExecutedQuery() ? '' : defaultQuery

      newSession = Immutable({
        id: cuid(),
        selectedViewer: 'ADMIN',
        query,
        variables: '',
        result: '',
        operationName: undefined,
        hasMutation: false,
        hasSubscription: false,
        hasQuery: false,
        queryTypes: getQueryTypes(query),
        starred: false,
      })
    }

    this.storage.saveSession(newSession)
    return newSession
  }

  private createSessionFromQuery = (query: string) => {
    return Immutable({
      id: cuid(),
      selectedViewer: 'ADMIN',
      query,
      variables: '',
      result: '',
      operationName: undefined,
      hasMutation: false,
      hasSubscription: false,
      hasQuery: false,
      queryTypes: getQueryTypes(query),
      starred: false,
    })
  }

  private handleChangeHeaders = (sessionId: string, headers: any[]) => {
    this.setValueInSession(sessionId, 'headers', headers)
  }

  private handleViewerChange = (sessionId: string, viewer: Viewer) => {
    this.setValueInSession(sessionId, 'selectedViewer', viewer, () => {
      if (viewer === 'USER') {
        // give the user some time to realize whats going on
        setTimeout(() => {
          this.setState(
            {
              selectUserOpen: true,
              selectUserSessionId: sessionId,
            } as State,
          )
        }, 300)
      }

      const session = this.state.sessions.find(sess => sess.id === sessionId)

      if (session) {
        this.resetSubscription(session)
      } else {
        throw new Error('session not found for viewer change')
      }
    })
  }

  private handleCloseSelectUser = () => {
    this.setState(
      {
        selectUserOpen: false,
      } as State,
    )
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

  private setValueInSession(
    sessionId: string,
    key: string,
    value: any,
    cb?: () => void,
  ) {
    this.setState(
      state => {
        // TODO optimize the lookup with a lookup table
        const i = state.sessions.findIndex(s => s.id === sessionId)
        return {
          ...state,
          sessions: Immutable.setIn(state.sessions, [i, key], value),
        }
      },
      () => {
        if (typeof cb === 'function') {
          cb()
        }
      },
    )
  }

  private isGraphcoolUrl(endpoint) {
    return endpoint.startsWith('https://api.graph.cool')
  }

  private getSimpleEndpoint() {
    if (this.props.isEndpoint) {
      return location.pathname
    }
    return this.props.endpoint
  }

  private getSystemEndpoint() {
    return `${this.state.httpApiPrefix}/system`
  }

  private getWSEndpoint() {
    return (
      this.props.subscriptionsEndpoint ||
      `${this.state.wsApiPrefix}/${this.props.projectId}`
    )
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
        session.operationName === item.operationName &&
        session.selectedViewer === item.selectedViewer,
    )
    return Boolean(duplicate)
  }

  private cancelSubscription = (session: Session) => {
    this.setValueInSession(session.id, 'subscriptionActive', false)
    if (session.subscriptionId) {
      this.wsConnections[session.id].unsubscribe(session.subscriptionId)
      this.setValueInSession(session.id, 'subscriptionId', null)
    }
  }

  private fetcher = (session: Session) => graphQLParams => {
    const { query, operationName } = graphQLParams

    if (!query.includes('IntrospectionQuery')) {
      if (
        [
          'STEP3_RUN_QUERY1',
          'STEP3_RUN_MUTATION1',
          'STEP3_RUN_MUTATION2',
          'STEP3_RUN_QUERY2',
        ].indexOf(this.props.onboardingStep || '') > -1 &&
        typeof this.props.nextStep === 'function'
      ) {
        if (this.props.onboardingStep === 'STEP3_RUN_QUERY2') {
          setTimeout(() => {
            // typescript wants to be happy...
            if (typeof this.props.nextStep === 'function') {
              this.props.nextStep()
            }
          }, 2000)
        } else {
          this.props.nextStep()
        }
      }

      if (!this.historyIncludes(session)) {
        setImmediate(() => {
          this.addToHistory(session)
        })
      }

      if (isQuerySubscription(query, operationName)) {
        return Observable.create(observer => {
          this.observers[session.id] = observer
          if (!session.subscriptionActive) {
            this.setValueInSession(session.id, 'subscriptionActive', true)
          }
          const id = this.wsConnections[
            session.id
          ].subscribe(graphQLParams, (err, res) => {
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

    const endpoint = this.getSimpleEndpoint()

    const headers: any = {
      'Content-Type': 'application/json',
      'x-graphcool-source': 'console:playground',
    }

    if (session.headers) {
      session.headers.forEach(header => {
        headers[header.name] = header.value
      })
    }

    if (session.selectedViewer === 'ADMIN' && this.state.adminAuthToken) {
      headers.Authorization = `Bearer ${this.state.adminAuthToken}`
    } else if (session.selectedViewer === 'USER' && session.selectedUserToken) {
      headers.Authorization = `Bearer ${session.selectedUserToken}`
    }

    return fetch(endpoint, {
      // tslint:disable-line
      method: 'post',
      headers,
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
}

export default withTheme<Props>(Playground)
