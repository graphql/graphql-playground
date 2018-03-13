import { createActions } from 'redux-actions'

export const { setHistoryOpen } = createActions({
  SET_HISTORY_OPEN: open => ({ open }),
})
