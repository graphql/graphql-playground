import { createActions } from 'redux-actions'

export const { selectAppHistoryItem } = createActions({
  SELECT_APP_HISTORY_ITEM: item => ({ item }),
})
