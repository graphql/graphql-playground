import { Record, OrderedMap } from 'immutable'
import { handleActions } from 'redux-actions'
import { createSelector } from 'reselect'
import { getSelectedWorkspace } from '../workspace/reducers'

// tslint:disable

export class AppHistory extends Record({
  items: OrderedMap(),
}) {
  items: OrderedMap<string, AppHistoryItem>
}

export class AppHistoryItem extends Record({
  type: 'local',
  path: '',
  lastOpened: undefined,
}) {
  type: 'local' | 'endpoint'
  path: string
  lastOpened: any
}

export default handleActions(
  {
    SELECT_APP_HISTORY_ITEM: (state, { payload }) =>
      state.set(payload.item.path, payload.item),
  },
  new AppHistory(),
)

export const getAppHistory = key =>
  createSelector([getSelectedWorkspace], state => {
    return state.appHistory
  })
