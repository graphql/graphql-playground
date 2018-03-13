import { createActions } from 'redux-actions'

export const {
  share,
  toggleShareHistory,
  toggleShareHTTPHeaders,
  toggleShareAllTabs,
} = createActions({
  TOGGLE_SHARE_HISTORY: () => ({}),
  TOGGLE_SHARE_HTTP_HEADERS: () => ({}),
  TOGGLE_SHARE_ALL_TABS: () => ({}),
  SHARE: () => ({}),
})
