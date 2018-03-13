import { createActions } from 'redux-actions'

export const { toggleHistoryItemStarring, addHistoryItem } = createActions({
  TOGGLE_HISTORY_ITEM_STARRING: sessionId => ({ sessionId }),
  ADD_HISTORY_ITEM: session => ({ session }),
})
