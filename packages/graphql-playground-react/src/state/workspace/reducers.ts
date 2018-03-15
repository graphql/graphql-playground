import { Reducer } from 'redux'
import { combineReducers } from 'redux-immutable'
import docs from '../docs/reducers'
import sessions, { makeSessionState } from '../sessions/reducers'
import sharing, { SharingState } from '../sharing/reducers'
import history from '../history/reducers'
import { Map, Record, OrderedMap } from 'immutable'
import general, { GeneralState } from '../general/reducers'

export function getSelectedWorkspaceId(state) {
  return state.get('selectedWorkspace')
}

export function getSelectedWorkspace(state) {
  return state.getIn(['workspaces', getSelectedWorkspaceId(state)])
}

const RootState = Record<any>({
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
  }

  const selectedWorkspaceId = getSelectedWorkspace(state)

  const path = ['workspaces', selectedWorkspaceId]

  action.selectedWorkspaceId = selectedWorkspaceId

  return state.setIn(path, workspaceReducers(state.getIn(path), action))
}

export function makeWorkspace(endpoint) {
  const Workspace = Record({
    docs: Map(),
    sessions: makeSessionState(endpoint),
    sharing: new SharingState(),
    history: OrderedMap(),
    general: new GeneralState(),
  })

  // weird typescript error
  return new Workspace() as any
}

export default rootReducer
