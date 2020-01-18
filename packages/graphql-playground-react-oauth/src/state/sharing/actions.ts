import { createActions } from 'redux-actions'

export const {
  share,
  toggleShareHistory,
  toggleShareHeaders,
  toggleShareAllTabs,
  setShareUrl,
} = createActions({
  TOGGLE_SHARE_HISTORY: () => ({}),
  TOGGLE_SHARE_HEADERS: () => ({}),
  TOGGLE_SHARE_ALL_TABS: () => ({}),
  SHARE: () => ({}),
  SET_SHARE_URL: shareUrl => ({ shareUrl }),
})
