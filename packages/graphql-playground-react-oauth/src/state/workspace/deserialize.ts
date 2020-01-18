import { DocsSession } from '../docs/reducers'
import { Session, SessionState, ResponseRecord } from '../sessions/reducers'
import { SharingState } from '../sharing/reducers'
import { Map, OrderedMap, List, fromJS } from 'immutable'
import { GeneralState } from '../general/reducers'
import { mapValues } from 'lodash'
import { RootState, Workspace, normalizeSettingsString } from './reducers'
import { AppHistory, AppHistoryItem } from '../appHistory/reducers'

export function deserializePersistedState(state) {
  return new RootState({
    workspaces: deserializeWorkspaces(state.workspaces),
    selectedWorkspace: state.selectedWorkspace,
    settingsString: normalizeSettingsString(state.settingsString),
    appHistory: deserializeAppHistory(state.appHistory),
    general: deserializeGeneral(state.general),
  }) as any
}

function deserializeWorkspaces(workspaces) {
  return Map(
    mapValues(workspaces, (workspace, workspaceId) => {
      return new Workspace({
        docs: deserializeDocs(workspace.docs),
        sessions: deserializeSessionsState(workspace.sessions),
        sharing: deserializeSharing(workspace.sharing),
        history: deserializeHistory(workspace.history),
      })
    }),
  )
}

function deserializeAppHistory(state) {
  return new AppHistory({
    items: OrderedMap(mapValues(state.items, item => new AppHistoryItem(item))),
  })
}

function deserializeDocs(state) {
  return Map(
    mapValues(state, docsSession => {
      return new DocsSession({
        docsOpen: docsSession.docsOpen,
        keyMove: docsSession.keyMove,
        docsWidth: docsSession.docsWidth,
        navStack: deserializeNavstack(docsSession.navStack),
      })
    }),
  )
}

function deserializeNavstack(navStack) {
  // note that stacks are plain objects. could be refactored to Map later
  return List(navStack.map(s => Map(s))) as any
}

function deserializeSessionsState(state) {
  const sessions = deserializeSessions(state.sessions)
  const selectedSessionId =
    state.selectedSessionId && state.selectedSessionId !== ''
      ? state.selectedSessionId
      : sessions.first()!.id
  return new SessionState({
    selectedSessionId,
    sessions,
    sessionCount: sessions.size,
    headers: state.headers,
  })
}

function deserializeSessions(state) {
  return OrderedMap(mapValues(state, session => deserializeSession(session)))
}

function deserializeSession(session) {
  return new Session({
    ...session,
    responses: deserializeResponses(session.responses),
    operations: fromJS(session.operations),
    variableToType: Map(session.variableToType),
    date: session.date ? new Date(session.date) : undefined,
    currentQueryStartTime: session.currentQueryStartTime
      ? new Date(session.currentQueryStartTime)
      : undefined,
    currentQueryEndTime: session.currentQueryEndTime
      ? new Date(session.currentQueryEndTime)
      : undefined,
    nextQueryStartTime: session.nextQueryStartTime
      ? new Date(session.nextQueryStartTime)
      : undefined,
  })
}

function deserializeResponses(responses) {
  return List(
    responses
      .filter(r => r.isSchemaError)
      .map(response => deserializeResponse(response)),
  )
}

function deserializeResponse(response) {
  return new ResponseRecord({
    resultID: response.resultID,
    date: response.date,
    time: new Date(response.time),
    isSchemaError: response.isSchemaError || false,
  })
}

function deserializeSharing({ shareUrl, ...state }) {
  // dont deserialize the shareUrl
  return new SharingState(state)
}

function deserializeHistory(state) {
  return deserializeSessions(state)
}

function deserializeGeneral(state) {
  return new GeneralState(state)
}
