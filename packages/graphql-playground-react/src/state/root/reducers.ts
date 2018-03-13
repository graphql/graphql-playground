import { Map } from 'immutable'
import reducers from '../../reducers'

const defaultState = Map({
  workspaces: Map({}),
  selectedWorkspace: '',
})

// todo: add lru-cache later when the localStorage is full
const rootReducer = (state = defaultState, action) => {
  if (action.type === 'SET_WORKSPACE') {
    return state.set('selectedWorkspace', action.payload.workspace)
  }

  const selectedWorkspaceId = getSelectedWorkspace(state)

  const path = ['workspaces', selectedWorkspaceId]

  return state.setIn(path, reducers(state.getIn(path), action))
}

export default rootReducer

const getSelectedWorkspaceId = state => state.get('selectedWorkspace')
export const getSelectedWorkspace = state =>
  state.getIn(['workspaces', getSelectedWorkspaceId(state)])
