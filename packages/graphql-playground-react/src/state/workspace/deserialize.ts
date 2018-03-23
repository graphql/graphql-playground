import { DocsSession } from '../docs/reducers'
import { Session, SessionState, ResponseRecord } from '../sessions/reducers'
import { SharingState } from '../sharing/reducers'
import { Map, OrderedMap, List } from 'immutable'
import { GeneralState } from '../general/reducers'
import { mapValues } from 'lodash'
import { RootState, Workspace } from './reducers'

export function deserializePersistedState(state) {
  return new RootState({
    workspaces: deserializeWorkspaces(state.workspaces),
    selectedWorkspace: state.selectedWorkspace,
    settingsString: state.settingsString,
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
        general: deserializeGeneral(workspace.general),
      })
    }),
  )
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
  return new SessionState({
    selectedSessionId: state.selectedSessionId,
    sessions,
    sessionCount: sessions.size,
  })
}

function deserializeSessions(state) {
  return OrderedMap(mapValues(state, session => deserializeSession(session)))
}

function deserializeSession(session) {
  return new Session({
    ...session,
    responses: deserializeResponses(session.responses),
    operations: List(session.operations),
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
  return List(responses.map(response => deserializeResponse(response)))
}

function deserializeResponse(response) {
  return new ResponseRecord({
    resultID: response.resultID,
    date: response.date,
    time: new Date(response.time),
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
