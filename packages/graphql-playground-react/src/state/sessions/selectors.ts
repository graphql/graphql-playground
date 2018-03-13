import { createSelector } from 'reselect'
import { getSelectedWorkspace } from '../root/reducers'

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

export const getHeadersCount = createSelector([getHeaders], headers => {
  try {
    const json = JSON.parse(headers)
    return Object.keys(json).length
  } catch (e) {
    //
  }

  return 0
})

export const getParsedHeaders = createSelector([getHeaders], headers => {
  try {
    const json = JSON.parse(headers)
    return json
  } catch (e) {
    //
  }

  return {}
})

export const getTracing = createSelector(
  [getResponseExtensions],
  extensions => extensions && extensions.tracing,
)

export const getSelectedSession = createSelector(
  [getSelectedWorkspace],
  state => state.getIn(['sessions', getSelectedSessionId(state)]),
)
export const getSelectedSessionId = state => state.get('selectedSessionId')

function makeSessionSelector(prop) {
  return createSelector([getSelectedSession], session => session.get(prop))
}
