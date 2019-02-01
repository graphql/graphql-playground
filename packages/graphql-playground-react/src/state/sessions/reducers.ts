import { OrderedMap, Map, List, Record, merge } from 'immutable'
import { handleActions, combineActions } from 'redux-actions'
import {
  editQuery,
  editVariables,
  editHeaders,
  editEndpoint,
  setEditorFlex,
  openQueryVariables,
  closeQueryVariables,
  setVariableEditorHeight,
  setResponseTracingHeight,
  setTracingSupported,
  setVariableToType,
  setOperations,
  setOperationName,
  setSubscriptionActive,
  startQuery,
  setQueryTypes,
  editName,
  setResponseExtensions,
  setCurrentQueryStartTime,
  setCurrentQueryEndTime,
} from './actions'
import { getSelectedSessionId } from './selectors'
import { getDefaultSession, defaultQuery } from '../../constants'
import * as cuid from 'cuid'
import { formatError } from './fetchingSagas'
import { arrayMove } from 'react-sortable-hoc'

export interface SessionStateProps {
  sessions: OrderedMap<string, Session>
  selectedSessionId: string
  sessionCount: number
  headers?: string
}

export interface Tab {
  endpoint: string
  query: string
  name?: string
  variables?: string
  responses?: string[]
  headers?: { [key: string]: string }
}

// tslint:disable
export class Session extends Record(getDefaultSession('')) {
  id: string
  endpoint: string

  query: string
  file?: string
  variables: string
  responses?: List<ResponseRecord>
  operationName?: string
  queryRunning: boolean
  subscriptionActive: boolean

  // query facts
  operations: List<OperationDefinition>
  variableToType: VariableToType

  // additional props that are interactive in graphiql, these are not represented in graphiqls state
  queryTypes: QueryTypes
  date: Date
  hasMutation: boolean
  hasSubscription: boolean
  hasQuery: boolean

  isFile?: boolean
  starred?: boolean
  name?: string
  filePath?: string
  selectedUserToken?: string
  headers?: string
  absolutePath?: string
  isSettingsTab?: boolean
  isConfigTab?: boolean

  currentQueryStartTime?: Date
  currentQueryEndTime?: Date

  isReloadingSchema: boolean
  isSchemaPendingUpdate: boolean

  responseExtensions: any
  queryVariablesActive: boolean
  endpointUnreachable: boolean

  // editor settings
  editorFlex: number
  variableEditorOpen: boolean
  variableEditorHeight: number
  responseTracingOpen: boolean
  responseTracingHeight: number
  nextQueryStartTime?: Date
  tracingSupported?: boolean
  docExplorerWidth: number
  changed?: boolean
  scrollTop?: number

  toJSON() {
    const obj = this.toObject()
    const override: any = {
      queryRunning: false,
      subscriptionActive: false,
      responseExtensions: {},
    }
    // dont serialize very big responses as the localStorage size is limited
    if (
      obj.responses &&
      obj.responses.size > 0 &&
      (obj.responses.size > 20 || obj.responses.get(0).date.length > 2000)
    ) {
      override.responses = List()
    }
    return merge(obj, override)
  }
}
export type VariableToType = Map<string, any>

export interface QueryTypes {
  firstOperationName: string | null
  subscription: boolean
  query: boolean
  mutation: boolean
}

export interface OperationDefinition {
  startLine: number
  endLine: number
  name: string
}
export interface ResponseType {
  resultID: string
  date: string
  time: Date
}

export class ResponseRecord extends Record({
  resultID: '',
  date: '',
  time: new Date(),
  isSchemaError: false,
}) {
  resultID: string
  date: string
  time: Date
  isSchemaError: boolean
}

function makeSession(endpoint = '') {
  return new Session({ endpoint }).set('id', cuid())
}

export function sessionFromTab(tab: Tab): Session {
  return new Session({
    ...tab,
    headers: tab.headers ? JSON.stringify(tab.headers, null, 2) : '',
    responses:
      tab.responses && tab.responses.length > 0
        ? List(tab.responses.map(r => new ResponseRecord({ date: r })))
        : List(),
  }).set('id', cuid())
}

export class SessionState extends Record({
  sessions: OrderedMap({}),
  selectedSessionId: '',
  sessionCount: 0,
  headers: '',
}) {
  sessions: OrderedMap<string, Session>
  selectedSessionId: string
  sessionCount: number
  headers: string
}

export function makeSessionState(endpoint) {
  const session = new Session({ endpoint: endpoint || '' })

  return new SessionState({
    sessions: OrderedMap({ [session.id]: session }),
    selectedSessionId: session.id,
    sessionCount: 1,
  })
}

const reducer = handleActions(
  {
    [combineActions(
      editQuery,
      editVariables,
      editHeaders,
      editEndpoint,
      setEditorFlex,
      openQueryVariables,
      closeQueryVariables,
      setVariableEditorHeight,
      setResponseTracingHeight,
      setTracingSupported,
      setVariableToType,
      setOperations,
      setOperationName,
      setSubscriptionActive,
      startQuery,
      setQueryTypes,
      editName,
      setResponseExtensions,
      setCurrentQueryStartTime,
      setCurrentQueryEndTime,
    )]: (state, { payload }) => {
      const keys = Object.keys(payload)
      const keyName = keys.length === 1 ? keys[0] : keys[1]
      const path = ['sessions', getSelectedSessionId(state), keyName]
      return state.setIn(path, payload[keyName])
    },
    START_QUERY: state => {
      return state
        .setIn(['sessions', getSelectedSessionId(state), 'queryRunning'], true)
        .setIn(
          ['sessions', getSelectedSessionId(state), 'responseExtensions'],
          undefined,
        )
    },
    CLOSE_TRACING: (state, { payload: { responseTracingHeight } }) => {
      return state.mergeDeepIn(
        ['sessions', getSelectedSessionId(state)],
        Map({ responseTracingHeight, responseTracingOpen: false }),
      )
    },
    TOGGLE_TRACING: state => {
      const path = [
        'sessions',
        getSelectedSessionId(state),
        'responseTracingOpen',
      ]
      return state.setIn(path, !state.getIn(path))
    },
    OPEN_TRACING: (state, { payload: { responseTracingHeight } }) => {
      return state.mergeDeepIn(
        ['sessions', getSelectedSessionId(state)],
        Map({ responseTracingHeight, responseTracingOpen: true }),
      )
    },
    CLOSE_VARIABLES: (state, { payload: { variableEditorHeight } }) => {
      return state.mergeDeepIn(
        ['sessions', getSelectedSessionId(state)],
        Map({ variableEditorHeight, variableEditorOpen: false }),
      )
    },
    OPEN_VARIABLES: (state, { payload: { variableEditorHeight } }) => {
      return state.mergeDeepIn(
        ['sessions', getSelectedSessionId(state)],
        Map({ variableEditorHeight, variableEditorOpen: true }),
      )
    },
    TOGGLE_VARIABLES: state => {
      const path = [
        'sessions',
        getSelectedSessionId(state),
        'variableEditorOpen',
      ]
      return state.setIn(path, !state.getIn(path))
    },
    ADD_RESPONSE: (state, { payload: { response, sessionId } }) => {
      return state.updateIn(['sessions', sessionId, 'responses'], responses =>
        responses.push(response),
      )
    },
    SET_RESPONSE: (state, { payload: { response, sessionId } }) => {
      return state.setIn(['sessions', sessionId, 'responses'], List([response]))
    },
    CLEAR_RESPONSES: state => {
      return state.setIn(
        ['sessions', getSelectedSessionId(state), 'responses'],
        List(),
      )
    },
    FETCH_SCHEMA: state => {
      return state.setIn(
        ['sessions', getSelectedSessionId(state), 'isReloadingSchema'],
        true,
      )
    },
    REFETCH_SCHEMA: state => {
      return state.setIn(
        ['sessions', getSelectedSessionId(state), 'isReloadingSchema'],
        true,
      )
    },
    STOP_QUERY: (state, { payload: { sessionId } }) => {
      return state.mergeIn(['sessions', sessionId], {
        queryRunning: false,
        subscriptionActive: false,
      })
    },
    SET_SCROLL_TOP: (state, { payload: { sessionId, scrollTop } }) => {
      if (state.sessions.get(sessionId)) {
        return state.setIn(['sessions', sessionId, 'scrollTop'], scrollTop)
      }
      return state
    },
    SCHEMA_FETCHING_SUCCESS: (state, { payload }) => {
      const newSessions = state.get('sessions').map((session: Session) => {
        if (session.endpoint === payload.endpoint) {
          // if there was an error, clear it away
          const data: any = {
            tracingSupported: payload.tracingSupported,
            isReloadingSchema: false,
            endpointUnreachable: false,
          }
          const response = session.responses ? session.responses!.first() : null
          if (
            response &&
            session.responses!.size === 1 &&
            response.isSchemaError
          ) {
            data.responses = List([])
          }
          return session.merge(Map(data))
        }
        return session
      })
      return state.set('sessions', newSessions)
    },
    SET_ENDPOINT_UNREACHABLE: (state, { payload }) => {
      const newSessions = state.get('sessions').map((session, sessionId) => {
        if (session.get('endpoint') === payload.endpoint) {
          return session.merge(
            Map({
              endpointUnreachable: true,
            }),
          )
        }
        return session
      })
      return state.set('sessions', newSessions)
    },
    SCHEMA_FETCHING_ERROR: (state, { payload }) => {
      const newSessions = state.get('sessions').map((session, sessionId) => {
        if (session.get('endpoint') === payload.endpoint) {
          let { responses } = session

          // Only override the responses if there is one or zero and that one is a schemaError
          // Don't override user's responses!
          if (responses.size <= 1) {
            let response = session.responses ? session.responses!.first() : null
            if (!response || response.isSchemaError) {
              response = new ResponseRecord({
                resultID: cuid(),
                isSchemaError: true,
                date: JSON.stringify(formatError(payload.error, true), null, 2),
                time: new Date(),
              })
            }
            responses = List([response])
          }

          return session.merge(
            Map({
              isReloadingSchema: false,
              endpointUnreachable: true,
              responses,
            }),
          )
        }
        return session
      })
      return state.set('sessions', newSessions)
    },
    SET_SELECTED_SESSION_ID: (state, { payload: { sessionId } }) =>
      state.set('selectedSessionId', sessionId),
    OPEN_SETTINGS_TAB: (state: any) => {
      let newState = state
      let settingsTab = state.sessions.find(value =>
        value.get('isSettingsTab', false),
      )
      if (!settingsTab) {
        settingsTab = makeSession().merge({
          isSettingsTab: true,
          isFile: true,
          name: 'Settings',
          changed: false,
        })
        newState = newState.setIn(['sessions', settingsTab.id], settingsTab)
      }
      return newState.set('selectedSessionId', settingsTab.id)
    },
    OPEN_CONFIG_TAB: state => {
      let newState = state
      let configTab = state.sessions.find(value =>
        value.get('isConfigTab', false),
      )
      if (!configTab) {
        configTab = makeSession().merge({
          isConfigTab: true,
          isFile: true,
          name: 'GraphQL Config',
          changed: false,
        })
        newState = newState.setIn(['sessions', configTab.id], configTab)
      }
      return newState.set('selectedSessionId', configTab.id)
    },
    NEW_FILE_TAB: (state, { payload: { fileName, filePath, file } }) => {
      let newState = state
      let fileTab = state.sessions.find(
        value => value.get('name', '') === fileName,
      )
      if (!fileTab) {
        fileTab = makeSession().merge({
          isFile: true,
          name: fileName,
          changed: false,
          file,
          filePath,
        })
        newState = newState.setIn(['sessions', fileTab.id], fileTab)
      }
      return newState
        .set('selectedSessionId', fileTab.id)
        .set('sessionCount', newState.sessions.size)
    },
    NEW_SESSION: (state, { payload: { reuseHeaders, endpoint } }) => {
      const currentSession = state.sessions.first()
      const newSession: any = {
        query: '',
        isReloadingSchema: currentSession.isReloadingSchema,
        endpointUnreachable: currentSession.endpointUnreachable,
      }
      if (currentSession.endpointUnreachable) {
        newSession.responses = currentSession.responses
      }
      let session = makeSession(endpoint || currentSession.endpoint).merge(
        newSession,
      )
      if (reuseHeaders) {
        const selectedSessionId = getSelectedSessionId(state)
        const currentSession = state.sessions.get(selectedSessionId)
        session = session.set('headers', currentSession.headers)
      } else {
        session = session.set('headers', state.headers)
      }
      return state
        .setIn(['sessions', session.id], session)
        .set('selectedSessionId', session.id)
        .set('sessionCount', state.sessions.size + 1)
    },
    // inject headers is used for graphql config
    // it makes sure, that there definitely is a tab open with the correct header
    INJECT_HEADERS: (state, { payload: { headers, endpoint } }) => {
      // if there are no headers to inject, there's nothing to do
      if (!headers || headers === '' || Object.keys(headers).length === 0) {
        return state
      }
      const headersString =
        typeof headers === 'string' ? headers : JSON.stringify(headers, null, 2)
      const selectedSessionId = getSelectedSessionId(state)
      let newState = state.set('headers', headersString)
      const currentSession = state.sessions.get(selectedSessionId)

      if (currentSession.headers === headersString) {
        return newState
      }

      if (currentSession.query === defaultQuery) {
        return newState.setIn(
          ['sessions', selectedSessionId, 'headers'],
          headersString,
        )
      }

      const session = makeSession(endpoint).set('headers', headersString)

      return newState
        .setIn(['sessions', session.id], session)
        .set('selectedSessionId', session.id)
        .set('sessionCount', state.sessions.size + 1)
    },
    DUPLICATE_SESSION: (state, { payload: { session } }) => {
      const newSession = session.set('id', cuid())
      return state
        .setIn(['sessions', newSession.id], newSession)
        .set('selectedSessionId', newSession.id)
        .set('sessionCount', state.sessions.size + 1)
    },
    NEW_SESSION_FROM_QUERY: (state, { payload: { query } }) => {
      const session = makeSession().set('query', query)
      return state
        .setIn(['sessions', session.id], session)
        .set('sessionCount', state.sessions.size + 1)
    },
    CLOSE_SELECTED_TAB: state => {
      const selectedSessionId = getSelectedSessionId(state)
      return closeTab(state, selectedSessionId).set(
        'sessionCount',
        state.sessions.size - 1,
      )
    },
    SELECT_NEXT_TAB: state => {
      const selectedSessionId = getSelectedSessionId(state)
      const count = state.sessions.size
      const keys = state.sessions.keySeq()
      const index = keys.indexOf(selectedSessionId)
      if (index + 1 < count) {
        return state.set('selectedSessionId', keys.get(index + 1))
      }
      return state.set('selectedSessionId', keys.get(0))
    },
    SELECT_PREV_TAB: state => {
      const selectedSessionId = getSelectedSessionId(state)
      const count = state.sessions.size
      const keys = state.sessions.keySeq()
      const index = keys.indexOf(selectedSessionId)
      if (index - 1 >= 0) {
        return state.set('selectedSessionId', keys.get(index - 1))
      }
      return state.set('selectedSessionId', keys.get(count - 1))
    },
    SELECT_TAB_INDEX: (state, { payload: { index } }) => {
      const keys = state.sessions.keySeq()
      return state.set('selectedSessionId', keys.get(index))
    },
    SELECT_TAB: (state, { payload: { sessionId } }) => {
      return state.set('selectedSessionId', sessionId)
    },
    CLOSE_TAB: (state, { payload: { sessionId } }) => {
      return closeTab(state, sessionId).set(
        'sessionCount',
        state.sessions.size - 1,
      )
    },
    REORDER_TABS: (state, { payload: { src, dest } }) => {
      const seq = state.sessions.toIndexedSeq()

      const indexes: number[] = []
      for (let i = 0; i < seq.size; i++) indexes.push(i)
      const newIndexes = arrayMove(indexes, src, dest)

      let newSessions = OrderedMap()
      for (let i = 0; i < seq.size; i++) {
        const ndx = newIndexes[i]
        const val = seq.get(ndx)
        newSessions = newSessions.set(val.id, val)
      }
      return state.set('sessions', newSessions)
    },
    EDIT_SETTINGS: state => {
      return state.setIn(
        ['sessions', getSelectedSessionId(state), 'changed'],
        true,
      )
    },
    SAVE_SETTINGS: state => {
      return state.setIn(
        ['sessions', getSelectedSessionId(state), 'changed'],
        false,
      )
    },
    EDIT_CONFIG: state => {
      return state.setIn(
        ['sessions', getSelectedSessionId(state), 'changed'],
        true,
      )
    },
    SAVE_CONFIG: state => {
      return state.setIn(
        ['sessions', getSelectedSessionId(state), 'changed'],
        false,
      )
    },
    EDIT_FILE: state => {
      return state.setIn(
        ['sessions', getSelectedSessionId(state), 'changed'],
        true,
      )
    },
    SAVE_FILE: state => {
      return state.setIn(
        ['sessions', getSelectedSessionId(state), 'changed'],
        false,
      )
    },
  },
  makeSessionState(''),
)

// add a self-healing wrapper to clean up broken states
export default (state, action) => {
  const newState: SessionState = reducer(state, action)
  if (newState.selectedSessionId === '' && state.sessions.size > 0) {
    return newState.set('selectedSessionId', state.sessions.first().id)
  }
  return newState
}

function closeTab(state, sessionId) {
  const length = state.sessions.size
  const keys = state.sessions.keySeq()
  let newState = state.removeIn(['sessions', sessionId])
  const session = state.sessions.get(sessionId)
  // if there is only one session, delete it and replace it by a new one
  // and keep the endpoint & headers of the last one
  if (length === 1) {
    const newSessionData: any = {
      query: '',
      headers: session.headers,
      isReloadingSchema: session.isReloadingSchema,
      endpointUnreachable: session.endpointUnreachable,
    }
    if (session.endpointUnreachable) {
      newSessionData.responses = session.responses
    }
    const newSession = makeSession(session.endpoint).merge(newSessionData)
    newState = newState.set('selectedSessionId', newSession.id)
    return newState.setIn(['sessions', newSession.id], newSession)
  }
  const selectedSessionId = getSelectedSessionId(state)
  const sessionIndex = keys.indexOf(sessionId)
  // if the session to be closed is selected, unselect it
  if (selectedSessionId === sessionId) {
    const leftNeighbour = sessionIndex - 1
    // if its the first session on the left, take the right neighbour
    if (leftNeighbour < 0) {
      return newState.set('selectedSessionId', keys.get(1))
    }
    return newState.set('selectedSessionId', keys.get(leftNeighbour))
  } else {
    // otherwise the old selected session still can be selected, only the session has to be removed
    return newState
  }
}
