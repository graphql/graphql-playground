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
} from './actions'
import { getSelectedSessionId } from './selectors'
import { getDefaultSession } from '../../constants'
import { SessionProps } from '../../types'

export type SessionType = Record<SessionProps>
export interface SessionStateProps {
  sessions: OrderedMap<string, SessionType>
  selectedSessionId: string
}
export type SessionStateType = Record<SessionStateProps>

export const Session = Record(getDefaultSession(''))

export const defaultSessionState = {
  sessions: OrderedMap(new Session()),
  selectedSessionId: '',
}

const SessionState = Record(defaultSessionState)

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
    )]: (state, { payload }) => {
      const keyName = Object.keys(payload)[1]
      return state.setIn(
        ['sessions', payload.sessionId, keyName],
        payload[keyName],
      )
    },
    SET_SELECTED_SESSION_ID: (state, { sessionId }) =>
      state.set('selectedSessionId', sessionId),
    CLOSE_TRACING: (state, { payload }) => {
      const { responseTracingHeight } = payload
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
    OPEN_TRACING: (state, { payload }) => {
      const { responseTracingHeight } = payload
      return state.mergeDeepIn(
        ['sessions', getSelectedSessionId(state)],
        Map({ responseTracingHeight, responseTracingOpen: true }),
      )
    },
    CLOSE_VARIABLES: (state, { payload }) => {
      const { variableEditorHeight } = payload
      return state.mergeDeepIn(
        ['sessions', getSelectedSessionId(state)],
        Map({ variableEditorHeight, variableEditorOpen: false }),
      )
    },
    OPEN_VARIABLES: (state, { payload }) => {
      const { variableEditorHeight } = payload
      return state.mergeDeepIn(
        ['sessions', getSelectedSessionId(state)],
        Map({ variableEditorHeight, variableEditorOpen: true }),
      )
    },
    ADD_RESPONSE: (state, { payload }) => {
      return state.updateIn(
        ['sessions', getSelectedSessionId(state), 'responses'],
        responses => responses.push(Map(payload.response)),
      )
    },
    SET_RESPONSE: (state, { payload }) => {
      return state.setIn(
        ['sessions', getSelectedSessionId(state), 'responses'],
        List(Map(payload.response)),
      )
    },
    CLEAR_RESPONSES: (state, { payload }) => {
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
  },
  new SessionState(),
)
