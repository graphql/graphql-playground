import { OrderedMap, Map, List, Record } from 'immutable'
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
} from './actions'
import { getSelectedSessionId } from './selectors'
import { getDefaultSession } from '../../constants'
import { SessionProps } from '../../types'
import * as cuid from 'cuid'

export { SessionProps } from '../../types'
export type SessionType = Record<SessionProps>
export interface SessionStateProps {
  sessions: OrderedMap<string, SessionType>
  selectedSessionId: string
}
export type SessionStateType = Record<SessionStateProps>

export const Session = Record(getDefaultSession(''))

function makeSession(endpoint = '') {
  return new Session({ endpoint }).set('id', cuid())
}

export function makeSessionState(endpoint) {
  const session = new Session({ endpoint: endpoint || '' })
  const SessionState = Record({
    sessions: OrderedMap({ [session.id]: session }),
    selectedSessionId: session.id,
  })

  return new SessionState()
}

export default handleActions(
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
    )]: (state, { payload }) => {
      const keys = Object.keys(payload)
      const keyName = keys.length === 1 ? keys[0] : keys[1]
      const path = ['sessions', getSelectedSessionId(state), keyName]
      return state.setIn(path, payload[keyName])
    },
    START_QUERY: state => {
      return state
        .setIn(['sessions', getSelectedSessionId(state), 'queryRunning'], true)
        .setIn(['sessions', getSelectedSessionId(state), 'responses'], List())
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
      return state.setIn(['sessions', sessionId, 'responses'], List(response))
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
    STOP_QUERY: (state, { payload: { sessionId } }) => {
      return state.setIn(['sessions', sessionId, 'queryRunning'], false)
    },
    SCHEMA_FETCHING_SUCCESS: (state, { payload }) => {
      const newSessions = state.get('sessions').map((session, sessionId) => {
        if (session.get('endpoint') === payload.endpoint) {
          return session.merge(
            Map({
              tracingSupported: payload.tracingSupported,
              isReloadingSchema: false,
              endpointUnreachable: false,
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
          return session.merge(
            Map({
              isReloadingSchema: false,
              endpointUnreachable: true,
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
        newState = newState.sessions.set(settingsTab.id, settingsTab)
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
        newState = newState.sessions.set(configTab.id, configTab)
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
        newState = newState.sessions.set(fileTab.id, fileTab)
      }
      return newState.set('selectedSessionId', fileTab.id)
    },
    NEW_SESSION: (state, { payload: { reuseHeaders, endpoint } }) => {
      let session = makeSession(endpoint)
      if (reuseHeaders) {
        const selectedSessionId = getSelectedSessionId(state)
        const currentSession = state.sessions.get(selectedSessionId)
        session = session.set('headers', currentSession)
      }
      return state
        .setIn(['sessions', session.id], session)
        .set('selectedSessionId', session.id)
    },
    DUPLICATE_SESSION: (state, { payload: { session } }) => {
      const newSession = session.set('id', cuid())
      return state
        .setIn(['sessions', newSession.id], newSession)
        .set('selectedSessionId', newSession.id)
    },
    NEW_SESSION_FROM_QUERY: (state, { payload: { query } }) => {
      const session = makeSession().set('query', query)
      return state.setIn(['sessions', session.id], session)
    },
    CLOSE_SELECTED_TAB: state => {
      const selectedSessionId = getSelectedSessionId(state)
      return closeTab(state, selectedSessionId)
    },
    SELECT_NEXT_TAB: state => {
      const selectedSessionId = getSelectedSessionId(state)
      const count = state.sessoins.size
      const keys = state.sessions.keySeq()
      const index = keys.indexOf(selectedSessionId)
      if (index + 1 < count) {
        return state.set('selectedSessionId', keys.get(index + 1))
      }
      return state.set('selectedSessionId', keys.get(0))
    },
    SELECT_PREV_TAB: state => {
      const selectedSessionId = getSelectedSessionId(state)
      const count = state.sessoins.size
      const keys = state.sessions.keySeq()
      const index = keys.indexOf(selectedSessionId)
      if (index - 1 > 0) {
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
      return closeTab(state, sessionId)
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

function closeTab(state, sessionId) {
  const length = state.sessions.size
  const keys = state.sessions.keySeq()
  let newState = state.removeIn(['sessions', sessionId])
  // if there is only one session, delete it and replace it by a new one
  if (length === 1) {
    const newSession = makeSession()
    newState = newState.set('selectedSessionId', newSession.id)
    return newState.setIn(['sessions', newSession.id], newSession)
  }
  const selectedSessionId = getSelectedSessionId(state)
  const sessionIndex = keys.indexOf(sessionId)
  // if the session to be closed is selected, unselect it
  if (selectedSessionId === sessionId) {
    const leftNeighbour = sessionIndex - 1
    if (leftNeighbour < 0) {
      return newState.set('selectedSessionId', keys.get(0))
    }
    return newState.set('selectedSessionId', keys.get(leftNeighbour))
  } else {
    // otherwise the old selected session still can be selected, only the session has to be removed
    return newState
  }
}
