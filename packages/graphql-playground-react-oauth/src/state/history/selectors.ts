import { createSelector } from 'reselect'
import { getSelectedWorkspace } from '../workspace/reducers'

export const getHistory = createSelector(
  [getSelectedWorkspace],
  state => state.history,
)
