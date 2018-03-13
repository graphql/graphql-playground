import { OrderedMap } from 'immutable'
import { handleActions } from 'redux-actions'
import { Session } from '../../types'

export type HistoryState = OrderedMap<string, Session>

export const defaultHistoryState: HistoryState = OrderedMap({})

export default handleActions(
  {
    TOGGLE_HISTORY_ITEM_STARRING: (state, { sessionId }) =>
      state.setIn([sessionId, 'starred'], !state.getIn([sessionId, 'starred'])),
    SET_ITEM: (state, { session }) => state.set(session.get('id'), session),
  },
  defaultHistoryState,
)
