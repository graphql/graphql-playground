import { createSelector } from 'reselect'
import { getSelectedWorkspace } from '../workspace/reducers'

const makeSharingSelector = key =>
  createSelector([getSelectedWorkspace], state => {
    return state.sharing.get(key)
  })

export const getSharingHistory = makeSharingSelector('history')
export const getSharingHeaders = makeSharingSelector('headers')
export const getSharingAllTabs = makeSharingSelector('allTabs')
export const getShareUrl = makeSharingSelector('shareUrl')
