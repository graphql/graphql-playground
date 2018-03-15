import { Record } from 'immutable'
import { handleActions } from 'redux-actions'

export interface SharingStateType {
  history: boolean
  headers: boolean
  allTabs: boolean
}

export const SharingState = Record({
  history: false,
  headers: true,
  allTabs: true,
})

export default handleActions(
  {
    TOGGLE_SHARE_HISTORY: state => state.set('history', !state.get('history')),
    TOGGLE_SHARE_HTTP_HEADERS: state =>
      state.set('headers', !state.get('headers')),
    TOGGLE_SHARE_ALL_TABS: state => state.set('allTabs', !state.get('allTabs')),
  },
  new SharingState(),
)
