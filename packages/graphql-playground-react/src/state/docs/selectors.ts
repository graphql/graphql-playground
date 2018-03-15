import { createSelector } from 'reselect'
import { getSelectedSessionId } from '../sessions/selectors'
import { DocsSession } from './reducers'
import { getSelectedWorkspace } from '../workspace/reducers'

const getSessionDocsState = createSelector([getSelectedWorkspace], state => {
  const sessionId = getSelectedSessionId(state)
  return state.docs.get(sessionId) || new DocsSession()
})

export const getSessionDocs = createSelector([getSessionDocsState], state => {
  return state.toJS()
})
