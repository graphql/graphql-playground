import { Record, OrderedMap } from 'immutable'
import { handleActions } from 'redux-actions'

// tslint:disable

export class AppHistory extends Record({
  items: OrderedMap(),
}) {
  items: OrderedMap<string, AppHistoryItem>
}

export class AppHistoryItem extends Record({
  type: 'local',
  configString: undefined,
  configPath: undefined,
  endpoint: undefined,
  folderName: undefined,
  env: undefined,
  platformToken: undefined,
  lastOpened: new Date(),
  config: undefined,
} as any) {
  type: 'local' | 'endpoint'
  configString?: string
  configPath?: string
  endpoint?: string
  folderName?: string
  env?: any
  platformToken?: string
  lastOpened: Date
  config?: any
}

export default handleActions(
  {
    SELECT_APP_HISTORY_ITEM: (state, { payload }) =>
      state.setIn(['items', payload.item.path], payload.item),
  },
  new AppHistory(),
)

export const getAppHistory = state => state.appHistory
