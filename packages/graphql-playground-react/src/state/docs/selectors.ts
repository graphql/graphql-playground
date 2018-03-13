import { createSelector } from 'reselect'
import { getSelectedWorkspace } from '../root/reducers'
import { getSelectedSessionId } from '../sessions/selectors'
import { DocsSession } from './reducers'

export const getSessionDocs = createSelector([getSelectedWorkspace], state => {
  const sessionId = getSelectedSessionId(state)
  return state.docs.get(sessionId) || new DocsSession()
})
