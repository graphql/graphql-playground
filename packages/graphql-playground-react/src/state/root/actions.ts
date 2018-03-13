import { createActions } from 'redux-actions'

export const { selectWorkspace, initState } = createActions({
  SELECT_WORKSPACE: workspace => ({ workspace }),
  INIT_STATE: (workspaceId, endpoint) => ({ workspaceId, endpoint }),
})
