import { Map, Record } from 'immutable'
import reducers, { makeWorkspace } from '../../reducers'

const RootState = Record<any>({
  workspaces: Map({}),
  selectedWorkspace: '',
})

// todo: add lru-cache later when the localStorage is full
const rootReducer = (state = new RootState(), action) => {
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

  return state.setIn(path, reducers(state.getIn(path), action))
}

export default rootReducer

const getSelectedWorkspaceId = state => state.get('selectedWorkspace')
export const getSelectedWorkspace = state =>
  state.getIn(['workspaces', getSelectedWorkspaceId(state)])
