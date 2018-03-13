import { createActions } from 'redux-actions'

export const { toggleHistoryItemStarring } = createActions({
  TOGGLE_HISTORY_ITEM_STARRING: sessionId => ({ sessionId }),
  SET_ITEM: session => ({ session }),
})
