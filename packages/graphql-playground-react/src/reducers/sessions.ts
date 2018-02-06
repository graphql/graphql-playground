import { Map, List } from 'immutable'
import { handleActions, combineActions } from 'redux-actions'
import { Session } from '../types'
import {
  editQuery,
  editVariables,
  editOperationName,
  editHeaders,
  editEndpoint,
  setEditorFlex,
  selectQueryVariables,
  unselectQueryVariables,
} from '../actions/sessions'

export type SessionState = Map<string, Session>

export const defaultSessionState: SessionState = Map({})

export default handleActions(
  {
    [combineActions(
      editQuery,
      editVariables,
      editOperationName,
      editHeaders,
      editEndpoint,
      setEditorFlex,
      selectQueryVariables,
      unselectQueryVariables,
    )]: (state, { payload }) => {
      const keyName = Object.keys(payload)[1]
      console.log(`setting simpleAction ${keyName}`)
      return state.setIn([payload.sessionId, keyName], payload[keyName])
    },
    CLOSE_TRACING: (state, { payload }) => {
      const { responseTracingHeight } = payload
      return state.mergeDeepIn(
        [payload.sessionId],
        Map({ responseTracingHeight, responseTracingOpen: false }),
      )
    },
    OPEN_TRACING: (state, { payload }) => {
      const { responseTracingHeight } = payload
      return state.mergeDeepIn(
        [payload.sessionId],
        Map({ responseTracingHeight, responseTracingOpen: true }),
      )
    },
    CLOSE_VARIABLES: (state, { payload }) => {
      const { variableEditorHeight } = payload
      return state.mergeDeepIn(
        [payload.sessionId],
        Map({ variableEditorHeight, variableEditorOpen: false }),
      )
    },
    OPEN_VARIABLES: (state, { payload }) => {
      const { variableEditorHeight } = payload
      return state.mergeDeepIn(
        [payload.sessionId],
        Map({ variableEditorHeight, variableEditorOpen: true }),
      )
    },
    ADD_RESPONSE: (state, { payload }) => {
      return state.updateIn([payload.sessionId, 'responses'], responses =>
        responses.push(Map(payload.response)),
      )
    },
    SET_RESPONSE: (state, { payload }) => {
      return state.setIn(
        [payload.sessionId, 'responses'],
        List(Map(payload.response)),
      )
    },
    CLEAR_RESPONSES: (state, { payload }) => {
      return state.setIn([payload.sessionId, 'responses'], List())
    },
    SCHEMA_FETCHING_SUCCESS: (state, { payload }) => {
      return state.map((session, sessionId) => {
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
    },
    SCHEMA_FETCHING_ERROR: (state, { payload }) => {
      return state.map((session, sessionId) => {
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
    },
  },
  defaultSessionState,
)
