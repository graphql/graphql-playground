import { OrderedMap } from 'immutable'
import { handleActions } from 'redux-actions'
import * as cuid from 'cuid'
import { SessionStateProps } from '../sessions/reducers'

export type HistoryState = OrderedMap<string, SessionStateProps>

export const defaultHistoryState: HistoryState = OrderedMap({})

export default handleActions(
  {
    TOGGLE_HISTORY_ITEM_STARRING: (state, { sessionId }) =>
      state.setIn([sessionId, 'starred'], !state.getIn([sessionId, 'starred'])),
    ADD_HISTORY_ITEM: (state, { session }) => {
      const id = cuid()
      state.set(
        id,
        session.merge({
          id,
          date: new Date(),
        }),
      )
    },
  },
  defaultHistoryState,
)
