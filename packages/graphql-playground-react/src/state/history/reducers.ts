import { OrderedMap, List } from 'immutable'
import { handleActions } from 'redux-actions'
import * as cuid from 'cuid'
import { SessionStateProps } from '../sessions/reducers'

export type HistoryState = OrderedMap<string, SessionStateProps>

export const defaultHistoryState: HistoryState = OrderedMap({})

export default handleActions(
  {
    TOGGLE_HISTORY_ITEM_STARRING: (state, { payload: { sessionId } }) =>
      state.setIn([sessionId, 'starred'], !state.getIn([sessionId, 'starred'])),
    ADD_HISTORY_ITEM: (state, { payload: { session } }) => {
      const id = cuid()
      return state.slice(-40).set(
        id,
        session.merge({
          id,
          date: new Date(),
          responses: List(),
        }),
      )
    },
  },
  defaultHistoryState,
)
