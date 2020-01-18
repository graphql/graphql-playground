import { createSelector } from 'reselect'
import { DocsSession } from './reducers'
import { getSelectedWorkspace } from '../workspace/reducers'

export const getSessionDocsState = createSelector(
  [getSelectedWorkspace],
  state => {
    const sessionId = state.sessions.selectedSessionId
    return state.docs.get(sessionId) || new DocsSession()
  },
)

export const getSessionDocs = createSelector([getSessionDocsState], state => {
  return state.toJS()
})
export const getDocsOpen = createSelector([getSessionDocsState], state => {
  return state.get('docsOpen')
})
