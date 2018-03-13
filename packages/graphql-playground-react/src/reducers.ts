import { Reducer } from 'redux'
import { combineReducers } from 'redux-immutable'
import docs from './state/docs/reducers'
import sessions, { makeSessionState } from './state/sessions/reducers'
import sharing, { SharingState } from './state/sharing/reducers'
import history from './state/history/reducers'
import { Record, OrderedMap, Map } from 'immutable'

const combinedReducers: Reducer<any> = combineReducers({
  docs,
  sessions,
  sharing,
  history,
})

export default combinedReducers

export function makeWorkspace(endpoint) {
  const Workspace = Record({
    docs: Map(),
    sessions: makeSessionState(endpoint),
    sharing: new SharingState(),
    history: OrderedMap(),
  })

  return new Workspace()
}
