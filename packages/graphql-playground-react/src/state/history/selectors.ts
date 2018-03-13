import { createSelector } from 'reselect'
import { getSelectedWorkspace } from '../root/reducers'

export const getHistory = createSelector(
  [getSelectedWorkspace],
  state => state.history,
)
