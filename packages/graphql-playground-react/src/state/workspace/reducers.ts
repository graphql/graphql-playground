import { Reducer } from 'redux'
import { combineReducers } from 'redux-immutable'
import docs, { DocsSession, DocsState } from '../docs/reducers'
import sessions, { makeSessionState, SessionState } from '../sessions/reducers'
import sharing, { SharingState } from '../sharing/reducers'
import history, { HistoryState } from '../history/reducers'
import { Map, Record, OrderedMap } from 'immutable'
import general, { GeneralState } from '../general/reducers'
// import { fromJS, isKeyed } from 'immutable'

export function getSelectedWorkspaceId(state) {
  return state.get('selectedWorkspace')
}

export function getSelectedWorkspace(state) {
  return state.getIn(['workspaces', getSelectedWorkspaceId(state)])
}

export class Workspace extends Record({
  docs: Map({}),
  sessions: makeSessionState(''),
  sharing: new SharingState(),
  history: OrderedMap(),
  general: new GeneralState(),
}) {
  docs: DocsState
  sessions: SessionState
  sharing: SharingState
  history: HistoryState
  general: GeneralState
}

export const RootState = Record<any>({
  workspaces: Map({ '': makeWorkspace('') }),
  selectedWorkspace: '',
})

const workspaceReducers: Reducer<any> = combineReducers({
  docs,
  sessions,
  sharing,
  history,
  general,
})

// todo: add lru-cache later when the localStorage is full
export const rootReducer = (state = new RootState(), action) => {
  if (action.type === 'SELECT_WORKSPACE') {
    return state.set('selectedWorkspace', action.payload.workspace)
  }

  if (action.type === 'INIT_STATE') {
    const { workspaceId, endpoint } = action.payload
    if (!state.workspaces.get(workspaceId)) {
      const newState = state.setIn(
        ['workspaces', workspaceId],
        makeWorkspace(endpoint),
      )
      return newState.set('selectedWorkspace', workspaceId)
    }
    return state.set('selectedWorkspace', workspaceId)
  }

  const selectedWorkspaceId = getSelectedWorkspaceId(state)

  const path = ['workspaces', selectedWorkspaceId]

  action.selectedWorkspaceId = selectedWorkspaceId

  return state.setIn(path, workspaceReducers(state.getIn(path), action))
}

export function makeWorkspace(endpoint) {
  const sessionState = makeSessionState(endpoint)

  // weird typescript error
  return new Workspace({
    docs: Map({
      [sessionState.selectedSessionId]: new DocsSession(),
    }),
    sessions: sessionState,
    sharing: new SharingState(),
    history: OrderedMap(),
    general: new GeneralState(),
  }) as any
}

export default rootReducer
