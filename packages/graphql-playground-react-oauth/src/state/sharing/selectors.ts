import { createSelector } from 'reselect'
import { getSelectedWorkspace } from '../workspace/reducers'

export const getSharingState = createSelector([getSelectedWorkspace], state => {
  return state.sharing
})

const makeSharingSelector = key =>
  createSelector([getSharingState], state => {
    return state.get(key)
  })

export const getSharingHistory = makeSharingSelector('history')
export const getSharingHeaders = makeSharingSelector('headers')
export const getSharingAllTabs = makeSharingSelector('allTabs')
export const getShareUrl = makeSharingSelector('shareUrl')
