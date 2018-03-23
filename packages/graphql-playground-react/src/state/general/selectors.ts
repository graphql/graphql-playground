import { createSelector } from 'reselect'
import { getSelectedWorkspace } from '../workspace/reducers'

const makeGeneralSelector = key =>
  createSelector([getSelectedWorkspace], state => {
    return state.general.get(key)
  })

export const getFixedEndpoint = makeGeneralSelector('fixedEndpoint')
export const getHistoryOpen = makeGeneralSelector('historyOpen')
export const getConfigString = makeGeneralSelector('configString')
