import { Record } from 'immutable'
import { handleActions } from 'redux-actions'

const SharingStateRecord = Record({
  history: false,
  headers: true,
  allTabs: true,
  shareUrl: null
})

export class SharingState extends SharingStateRecord {}

export default handleActions(
  {
    TOGGLE_SHARE_HISTORY: state => state.set('history', !state.history),
    TOGGLE_SHARE_HEADERS: state => state.set('headers', !state.headers),
    TOGGLE_SHARE_ALL_TABS: state => state.set('allTabs', !state.allTabs),
    SET_SHARE_URL: (state, { payload: { shareUrl } }) =>
      state.set('shareUrl', shareUrl)
  },
  new SharingState()
)
