import { Reducer } from 'redux'
import { combineReducers } from 'redux-immutable'
import docs, { DocsSession, DocsState } from '../docs/reducers'
import sessions, { makeSessionState, SessionState } from '../sessions/reducers'
import sharing, { SharingState } from '../sharing/reducers'
import history, { HistoryState } from '../history/reducers'
import { Map, Record, OrderedMap } from 'immutable'
import general, { GeneralState } from '../general/reducers'
import { immutableMemoize } from '../../components/Playground/util/immutableMemoize'
import { createSelector } from 'reselect'
import { deserializePersistedState } from './deserialize'
import appHistory, { AppHistory } from '../appHistory/reducers'
// import { createSelector } from 'reselect'

export function getSelectedWorkspaceId(state) {
  return state.get('selectedWorkspace')
}

export function getSelectedWorkspace(state) {
  return state.getIn(['workspaces', getSelectedWorkspaceId(state)])
}

export class Workspace extends Record({
  docs: Map({}),
  sessions: makeSessionState(''),
  sharing: new SharingState(),
  history: OrderedMap(),
  general: new GeneralState(),
  appHistory: new AppHistory(),
}) {
  docs: DocsState
  sessions: SessionState
  sharing: SharingState
  history: HistoryState
  general: GeneralState
  appHistory: AppHistory
}

export const defaultSettings = {
  'general.betaUpdates': false,
  'editor.theme': 'dark',
  'editor.reuseHeaders': true,
  'request.credentials': 'omit',
  'tracing.hideTracingResponse': true,
}

export const RootState = Record<any>({
  workspaces: Map({ '': makeWorkspace('') }),
  selectedWorkspace: '',
  settingsString: JSON.stringify(defaultSettings, null, 2),
  stateInjected: false,
})

const workspaceReducers: Reducer<any> = combineReducers({
  docs,
  sessions,
  sharing,
  history,
  general,
  appHistory,
})

// todo: add lru-cache later when the localStorage is full
export const rootReducer = (state = new RootState(), action) => {
  if (action.type === 'SELECT_WORKSPACE') {
    return state.set('selectedWorkspace', action.payload.workspace)
  }

  if (action.type === 'SET_SETTINGS_STRING') {
    return state.set('settingsString', action.payload.settingsString)
  }

  if (action.type === 'INIT_STATE' && !state.stateInjected) {
    const { workspaceId, endpoint } = action.payload
    if (!state.workspaces.get(workspaceId)) {
      const newState = state.setIn(
        ['workspaces', workspaceId],
        makeWorkspace(endpoint),
      )
      return newState.set('selectedWorkspace', workspaceId)
    }
    return state.set('selectedWorkspace', workspaceId)
  }

  if (action.type === 'INJECT_STATE') {
    return deserializePersistedState(action.payload.state).set(
      'stateInjected',
      true,
    )
  }

  const selectedWorkspaceId =
    action.payload && action.payload.workspaceId
      ? action.payload.workspaceId
      : getSelectedWorkspaceId(state)

  const path = ['workspaces', selectedWorkspaceId]

  return state.setIn(path, workspaceReducers(state.getIn(path), action))
}

export function makeWorkspace(endpoint) {
  const sessionState = makeSessionState(endpoint)

  // weird typescript error
  return new Workspace({
    docs: Map({
      [sessionState.selectedSessionId]: new DocsSession(),
    }),
    sessions: sessionState,
    sharing: new SharingState(),
    history: OrderedMap(),
    general: new GeneralState(),
  }) as any
}

export default rootReducer

export const getSessionCounts = immutableMemoize(state => {
  return state.workspaces.map(w => w.sessions.sessionCount)
})

export const getSettingsString = state => state.settingsString
export const getSettings = createSelector(
  [getSettingsString],
  (settingsString: any) => {
    try {
      return normalizeSettings(JSON.parse(settingsString))
    } catch (e) {
      return defaultSettings
    }
  },
)

function normalizeSettings(settings) {
  const theme = settings['editor.theme']
  if (theme !== 'dark' && theme !== 'light') {
    settings['editor.theme'] = 'dark'
  }

  return settings
}

export const getTheme = createSelector([getSettings], s => s.theme || 'dark')
