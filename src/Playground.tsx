import * as React from 'react'
import {CustomGraphiQL} from './GraphiQL/CustomGraphiQL'
import * as fetch from 'isomorphic-fetch'
import {
  buildClientSchema,
} from 'graphql'
import {TabBar} from './GraphiQL/TabBar'
import {introspectionQuery, defaultQuery} from './constants'
import {Session} from './types'
import * as cuid from 'cuid'
import * as Immutable from 'seamless-immutable'
import PlaygroundStorage from './PlaygroundStorage'
import getQueryTypes from './GraphiQL/util/getQueryTypes'
import debounce from 'graphiql/dist/utility/debounce'
import {Observable} from 'rxjs/Observable'
import {Client} from 'subscriptions-transport-ws'
import isQuerySubscription from './GraphiQL/util/isQuerySubscription'
import HistoryPopup from './HistoryPopup'
import * as cx from 'classnames'

export type Endpoint = 'SIMPLE' | 'RELAY'
export type Viewer = 'ADMIN' | 'EVERYONE' | 'USER'

export interface State {
  schema: any
  sessions: Session[]
  selectedSessionIndex: number
  schemaCache: SchemaCache
  historyOpen: boolean
  history: Session[]
}

export interface Props {
  projectId: string
  authToken?: string
}

export interface SchemaCache {
  simple: any
  relay: any
}

export default class Playground extends React.Component<Props,State> {
  storage: PlaygroundStorage
  ws: any
  private updateQueryTypes = debounce(150, (sessionId: string, query: string) => {
    const queryTypes = getQueryTypes(query)
    this.setValueInSession(sessionId, 'queryTypes', queryTypes)
  })
  constructor(props) {
    super(props)
    this.storage = new PlaygroundStorage(props.projectId)

    const sessions = this.initSessions()

    const selectedSessionIndex = (parseInt(this.storage.getItem('selectedSessionIndex'), 10) || 0)
    this.state = {
      schema: null,
      schemaCache: {
        simple: null,
        relay: null,
      },
      sessions,
      selectedSessionIndex: selectedSessionIndex < sessions.length && selectedSessionIndex > -1
        ? selectedSessionIndex : 0,
      historyOpen: false,
      history: this.storage.getHistory(),
    }

    if (typeof window === 'object') {
      window.addEventListener('beforeunload', () => {
        this.componentWillUnmount()
      })
    }
    global['p'] = this
  }
  setWS() {
    this.ws = new Client(this.getWSEndpoint(), {
      timeout: 5000,
    })
  }
  componentWillMount() {
    // look, if there is a session. if not, initiate one.
    this.fetchSchemas()
      .then(this.initSessions)
  }
  componentWillUnmount() {
    this.storage.setItem('selectedSessionIndex', String(this.state.selectedSessionIndex))
    this.saveSessions()
    this.saveHistory()
    this.storage.saveProject()
  }
  componentDidMount() {
    this.setWS()
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.projectId !== this.props.projectId) {
      this.setWS()
      this.fetchSchemas()
    }
  }
  fetchSchemas() {
    return Promise.all([
      this.fetchSchema(this.getRelayEndpoint()),
      this.fetchSchema(this.getSimpleEndpoint()),
    ])
      .then(([relaySchemaData, simpleSchemaData]) => {
        const relaySchema = buildClientSchema(relaySchemaData.data)
        const simpleSchema = buildClientSchema(simpleSchemaData.data)

        this.setState({
          schemaCache: {
            relay: relaySchema,
            simple: simpleSchema,
          },
        } as State)
      })
  }
  fetchSchema(endpointUrl: string) {
    return fetch(endpointUrl, { // tslint:disable-line
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': this.state.selectedUserId === GUEST.id ?
        //   '' :
        //   `Bearer ${this.state.selectedUserToken || this.state.adminToken}`,
      },
      body: JSON.stringify({query: introspectionQuery}),
    })
    .then((response) => {
      return response.json()
    })
  }
  render() {
    const {sessions, selectedSessionIndex} = this.state
    return (
      <div
        className={cx(
          'root',
          {
            'blur': this.state.historyOpen,
          },
        )}
      >
        <style jsx>{`
          .root {
            @inherit: .h100, .flex, .flexColumn;
          }

          .blur {
            filter: blur(5px);
          }

          .graphiqls-container {
            @inherit: .relative, .overflowHidden;
            height: calc(100% - 57px);
          }

          .graphiql-wrapper {
            @inherit: .w100, .h100, .relative;
          }
        `}</style>
        <TabBar
          sessions={sessions}
          selectedSessionIndex={selectedSessionIndex}
          onNewSession={() => this.handleNewSession(false)}
          onCloseSession={this.handleCloseSession}
          onOpenHistory={this.handleOpenHistory}
          onSelectSession={this.handleSelectSession}
        />
        <div className='graphiqls-container docs-graphiql'>
          {sessions.map((session, index) => (
            <div
              key={session.id}
              className={cx(
                'graphiql-wrapper',
                {
                   'active': index === selectedSessionIndex,
                },
              )}
              style={{
                top: `-${100 * selectedSessionIndex}%`,
              }}
            >
              <CustomGraphiQL
                key={session.id}
                schema={this.state.schemaCache[session.selectedEndpoint]}
                fetcher={this.fetcher(session)}
                selectedEndpoint={session.selectedEndpoint}
                showQueryTitle={false}
                showResponseTitle={false}
                showViewAs={true}
                showEndpoints={true}
                showDownloadJsonButton={true}
                showCodeGeneration={false}
                selectedViewer={session.selectedViewer}
                storage={this.storage.getSessionStorage(session.id)}
                query={session.query}
                variables={session.variables}
                operationName={session.operationName}
                onChangeEndpoint={(endpoint: Endpoint) => this.handleEndpointChange(session.id, endpoint)}
                onChangeViewer={(viewer: Viewer) => this.handleViewerChange(session.id, viewer)}
                onEditOperationName={(name: string) => this.handleOperationNameChange(session.id, name)}
                onEditVariables={(variables: string) => this.handleVariableChange(session.id, variables)}
                onEditQuery={(query: string) => this.handleQueryChange(session.id, query)}
              />
            </div>
          ))}
        </div>
        {this.state.historyOpen && (
          <HistoryPopup
            isOpen={this.state.historyOpen}
            onRequestClose={this.handleCloseHistory}
            historyItems={this.state.history}
            onItemStarToggled={this.handleItemStarToggled}
            fetcherCreater={this.fetcher}
            schemas={this.state.schemaCache}
            onCreateSession={this.handleCreateSession}
          />
        )}
      </div>
    )
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

      return {
        ...state,
        selectedSessionIndex: i,
      }
    })
  }

  private initSessions = () => {
    const sessions = this.storage.getSessions()

    if (sessions.length > 0) {
      return sessions
    }

    return [this.createSession()]
  }

  private saveSessions = () => {
    this.state.sessions.forEach(session => this.storage.saveSession(session, false))
  }

  private saveHistory = () => {
    this.storage.syncHistory(this.state.history)
  }

  private handleNewSession = (newIndexZero: boolean = false) => {
    const session = this.createSession()
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
      newSession = Immutable({
        id: cuid(),
        selectedEndpoint: 'SIMPLE',
        selectedViewer: 'ADMIN',
        query: defaultQuery,
        variables: '',
        result: '',
        operationName: undefined,
        hasMutation: false,
        hasSubscription: false,
        hasQuery: false,
        queryTypes: getQueryTypes(defaultQuery),
        starred: false,
      })
    }

    this.storage.saveSession(newSession)
    return newSession
  }

  private handleViewerChange = (sessionId: string, viewer: Viewer) => {
    this.setValueInSession(sessionId, 'selectedViewer', viewer)
  }

  private handleEndpointChange = (sessionId: string, endpoint: Endpoint) => {
    this.setValueInSession(sessionId, 'selectedEndpoint', endpoint)
  }

  private handleQueryChange = (sessionId: string, query: string) => {
    this.setValueInSession(sessionId, 'query', query)
    this.updateQueryTypes(sessionId, query)
  }

  private handleVariableChange = (sessionId: string, variables: string) => {
    this.setValueInSession(sessionId, 'variables', variables)
  }

  private handleOperationNameChange = (sessionId: string, operationName: string) => {
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

  private setValueInSession(sessionId: string, key: string, value: any) {
    this.setState(state => {
      // TODO optimize the lookup with a lookup table
      const i = state.sessions.findIndex(s => s.id === sessionId)
      return {
        ...state,
        sessions: Immutable.setIn(state.sessions, [i, key], value),
      }
    })
  }

  private getSimpleEndpoint() {
    return `https://api.graph.cool/simple/v1/${this.props.projectId}`
  }

  private getRelayEndpoint() {
    return `https://api.graph.cool/relay/v1/${this.props.projectId}`
  }

  private getWSEndpoint() {
    return `ws://subscriptions.graph.cool/${this.props.projectId}`
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
    const duplicate = this.state.history
      .find(item => (
          session.query === item.query
          && session.variables === item.variables
          && session.operationName === item.operationName
          && session.selectedViewer === item.selectedViewer
          && session.selectedEndpoint === item.selectedEndpoint
      ))
    return Boolean(duplicate)
  }

  private fetcher = (session: Session) => ((graphQLParams) => {
    const {query, operationName} = graphQLParams

    if (!query.includes('IntrospectionQuery') && !this.historyIncludes(session)) {
      setImmediate(() => {
        this.addToHistory(session)
      })
    }

    if (!query.includes('IntrospectionQuery') && isQuerySubscription(query, operationName)) {
      return Observable.create(observer => {
        const id = this.ws.subscribe(graphQLParams, (err, res) => {
          const data = {data: res, isSubscription: true}
          // console.log(`Response from ${id}`, err, data)
          if (err) {
            observer.completed()
            return
          }
          observer.next(data)
        })

        return () => {
          this.ws.unsubscribe(id)
        }
      })
    }

    const endpoint = session.selectedEndpoint === 'SIMPLE' ? this.getSimpleEndpoint() : this.getRelayEndpoint()
    return fetch(endpoint, { // tslint:disable-line
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': session.selectedViewer === 'ADMIN' ? `Bearer ${this.props.authToken}` : '',
      },
      body: JSON.stringify(graphQLParams),
    })
    .then((response) => {
      return response.json()
    })
  })
}
