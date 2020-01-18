import { createSelector } from 'reselect'
import { makeWorkspace } from '../workspace/reducers'

function getSelectedWorkspaceId(state) {
  return state.get('selectedWorkspace')
}
function getSelectedWorkspace(state) {
  return (
    state.getIn(['workspaces', getSelectedWorkspaceId(state)]) ||
    makeWorkspace('')
  )
}

export const getSessionsState = createSelector(
  [getSelectedWorkspace],
  workspace => workspace.get('sessions'),
)

export const getSelectedSession = createSelector([getSessionsState], state => {
  const id = getSelectedSessionId(state)
  const session = state.getIn(['sessions', id])
  return session
})

export const getSelectedSessionId = state =>
  state.selectedSessionId && state.selectedSessionId !== ''
    ? state.selectedSessionId
    : state.sessions.first().id

export const getSelectedSessionIdFromRoot = createSelector(
  [getSelectedSession],
  state => state.get('id'),
)

const makeSessionSelector = prop => {
  return createSelector([getSelectedSession], session => session.get(prop))
}

export const getScrollTop = makeSessionSelector('scrollTop')
export const getEndpoint = makeSessionSelector('endpoint')
export const getQuery = makeSessionSelector('query')
export const getFile = makeSessionSelector('file')
export const getVariables = makeSessionSelector('variables')
export const getResponses = makeSessionSelector('responses')
export const getOperationName = makeSessionSelector('operationName')
export const getQueryRunning = makeSessionSelector('queryRunning')
export const getSubscriptionActive = makeSessionSelector('subscriptionActive')
export const getOperations = makeSessionSelector('operations')
export const getVariableToType = makeSessionSelector('variableToType')
export const getQueryTypes = makeSessionSelector('queryTypes')
export const getDate = makeSessionSelector('date')
export const getHasMutation = makeSessionSelector('hasMutation')
export const getHasSubscription = makeSessionSelector('hasSubscription')
export const getHasQuery = makeSessionSelector('hasQuery')
export const getIsFile = makeSessionSelector('isFile')
export const getStarred = makeSessionSelector('starred')
export const getName = makeSessionSelector('name')
export const getFilePath = makeSessionSelector('filePath')
export const getSelectedUserToken = makeSessionSelector('selectedUserToken')
export const getHeaders = makeSessionSelector('headers')
export const getHasChanged = makeSessionSelector('hasChanged')
export const getAbsolutePath = makeSessionSelector('absolutePath')
export const getIsSettingsTab = makeSessionSelector('isSettingsTab')
export const getIsConfigTab = makeSessionSelector('isConfigTab')
export const getCurrentQueryStartTime = makeSessionSelector(
  'currentQueryStartTime',
)
export const getCurrentQueryEndTime = makeSessionSelector('currentQueryEndTime')
export const getIsReloadingSchema = makeSessionSelector('isReloadingSchema')
export const getIsPollingSchema = createSelector(
  [getEndpoint, getSettings],
  (endpoint, settings) => {
    const json = JSON.parse(settings)
    try {
      const isPolling =
        json['schema.polling.enable'] &&
        endpoint.match(`/${json['schema.polling.endpointFilter']}`) &&
        true
      return isPolling
    } catch (e) {
      return false
    }
  },
)

export const getResponseExtensions = makeSessionSelector('responseExtensions')
export const getQueryVariablesActive = makeSessionSelector(
  'queryVariablesActive',
)
export const getEndpointUnreachable = makeSessionSelector('endpointUnreachable')
export const getEditorFlex = makeSessionSelector('editorFlex')
export const getVariableEditorOpen = makeSessionSelector('variableEditorOpen')
export const getVariableEditorHeight = makeSessionSelector(
  'variableEditorHeight',
)
export const getResponseTracingOpen = makeSessionSelector('responseTracingOpen')
export const getResponseTracingHeight = makeSessionSelector(
  'responseTracingHeight',
)
export const getDocExplorerWidth = makeSessionSelector('docExplorerWidth')
export const getNextQueryStartTime = makeSessionSelector('nextQueryStartTime')
export const getTracingSupported = makeSessionSelector('tracingSupported')

function getSettings(state) {
  return state.getIn(['settingsString'])
}

export const getTabWidth = createSelector([getSettings], settings => {
  try {
    const json = JSON.parse(settings)
    return json['prettier.tabWidth'] || 2
  } catch (e) {
    //
  }

  return 2
})

export const getUseTabs = createSelector([getSettings], settings => {
  try {
    const json = JSON.parse(settings)
    return json['prettier.useTabs'] || false
  } catch (e) {
    //
  }

  return false
})

export const getHeadersCount = createSelector([getHeaders], headers => {
  try {
    const json = JSON.parse(headers)
    return Object.keys(json).length
  } catch (e) {
    //
  }

  return 0
})

export const getParsedHeaders = createSelector(
  [getSelectedSession],
  getParsedHeadersFromSession,
)

export function getParsedHeadersFromSession(headers) {
  try {
    const json = JSON.parse(headers)
    return json
  } catch (e) {
    //
  }

  return {}
}

export const getParsedVariables = createSelector(
  [getSelectedSession],
  getParsedVariablesFromSession,
)

export function getParsedVariablesFromSession(session) {
  const variables = session.variables

  try {
    const json = JSON.parse(variables)
    return json
  } catch (e) {
    //
  }

  return {}
}

export const getTracing = createSelector(
  [getResponseExtensions],
  extensions => extensions && extensions.tracing,
)

export const getSessionsArray = createSelector([getSessionsState], state => {
  const array = state
    .get('sessions')
    .toArray()
    .map(arr => arr[1])

  return array
})
