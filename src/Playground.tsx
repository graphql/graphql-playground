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
import * as cx from 'classnames'
import getQueryTypes from './GraphiQL/util/getQueryTypes'
import debounce from 'graphiql/dist/utility/debounce'

global['Immutable'] = Immutable

export type Endpoint = 'SIMPLE' | 'RELAY'
export type Viewer = 'ADMIN' | 'EVERYONE' | 'USER'

interface State {
  selectedEndpoint: Endpoint
  selectedViewer: Viewer
  schema: any
  sessions: Session[]
  selectedSessionIndex: number
  schemaCache: SchemaCache
}

interface Props {
  projectId: string
}

interface SchemaCache {
  simple: any
  relay: any
}

export default class Playground extends React.Component<Props,State> {
  storage: PlaygroundStorage
  constructor(props) {
    super(props)
    this.storage = new PlaygroundStorage(props.projectId)

    const sessions = this.initSessions()

    const selectedSessionIndex = (parseInt(this.storage.getItem('selectedSessionIndex'), 10) || 0)
    this.state = {
      selectedEndpoint: 'SIMPLE',
      schema: null,
      schemaCache: {
        simple: null,
        relay: null,
      },
      selectedViewer: 'ADMIN',
      sessions,
      selectedSessionIndex: selectedSessionIndex < sessions.length && selectedSessionIndex > -1
        ? selectedSessionIndex : 0,
    }

    if (typeof window === 'object') {
      window.addEventListener('beforeunload', () => {
        this.componentWillUnmount()
        return 'Are you sure?'
      })
    }
    global['p'] = this
  }
  componentWillMount() {
    // look, if there is a session. if not, initiate one.
    this.fetchSchemas()
      .then(this.initSessions)
  }
  componentWillUnmount() {
    this.storage.setItem('selectedSessionIndex', String(this.state.selectedSessionIndex))
    this.saveSessions()
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
      <div className='root'>
        <style jsx>{`
          .root {
            @inherit: .h100, .flex, .flexColumn;
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
          onNewSession={() => this.handleNewSession()}
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
                fetcher={this.fetcher}
                selectedEndpoint={session.selectedEndpoint}
                showQueryTitle={false}
                showResponseTitle={false}
                selectedViewer={this.state.selectedViewer}
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
      </div>
    )
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
    this.storage.saveProject()
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

  private createSession = () => {
    const newSession: Session = Immutable({
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
    })

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

  private updateQueryTypes = debounce(150, (sessionId: string, query: string) => {
    const queryTypes = getQueryTypes(query)
    this.setValueInSession(sessionId, 'queryTypes', queryTypes)
  })

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

  private getEndpoint() {
    return this.state.selectedEndpoint === 'SIMPLE' ? this.getSimpleEndpoint() : this.getRelayEndpoint()
  }

  private getSimpleEndpoint() {
    return `https://api.graph.cool/simple/v1/${this.props.projectId}`
  }

  private getRelayEndpoint() {
    return `https://api.graph.cool/relay/v1/${this.props.projectId}`
  }

  private fetcher = (graphQLParams) => {
    const endpoint = this.getEndpoint()

    return fetch(endpoint, { // tslint:disable-line
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': this.state.selectedUserId === GUEST.id ?
        //   '' :
        //   `Bearer ${this.state.selectedUserToken || this.state.adminToken}`,
      },
      body: JSON.stringify(graphQLParams),
    })
    .then((response) => {
      return response.json()
    })
  }
}
