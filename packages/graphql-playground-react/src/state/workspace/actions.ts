import { createActions } from 'redux-actions'

export const { selectWorkspace, initState, injectState } = createActions({
  SELECT_WORKSPACE: workspace => ({ workspace }),
  INIT_STATE: (workspaceId, endpoint) => ({ workspaceId, endpoint }),
  INJECT_STATE: state => ({ state }),
})
