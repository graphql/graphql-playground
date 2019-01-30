import { createActions } from 'redux-actions'

export const {
  editQuery,
  editVariables,
  setOperationName,
  editHeaders,
  editEndpoint,
  setVariableToType,
  setOperations,
  startQuery,
  stopQuery,
  setEditorFlex,
  openQueryVariables,
  closeQueryVariables,
  setVariableEditorHeight,
  setResponseTracingHeight,
  setTracingSupported,
  closeTracing,
  openTracing,
  closeVariables,
  openVariables,
  addResponse,
  setResponse,
  clearResponses,
  openSettingsTab,
  schemaFetchingSuccess,
  schemaFetchingError,
  setEndpointUnreachable,
  renewStacks,
  runQuery,
  prettifyQuery,
  fetchSchema,
  updateQueryFacts,
  runQueryAtPosition,
  toggleTracing,
  toggleVariables,
  newSession,
  newSessionFromQuery,
  newFileTab,
  closeTab,
  closeSelectedTab,
  editSettings,
  saveSettings,
  editConfig,
  saveConfig,
  editFile,
  saveFile,
  selectTab,
  selectTabIndex,
  selectNextTab,
  selectPrevTab,
  duplicateSession,
  querySuccess,
  queryError,
  setSubscriptionActive,
  setQueryTypes,
  injectHeaders,
  openConfigTab,
  editName,
  setResponseExtensions,
  setCurrentQueryStartTime,
  setCurrentQueryEndTime,
  refetchSchema,
  setScrollTop,
  reorderTabs,
} = createActions({
  // simple property setting
  EDIT_QUERY: query => ({ query }),
  EDIT_HEADERS: simpleAction('headers'),
  EDIT_ENDPOINT: simpleAction('endpoint'),
  EDIT_VARIABLES: simpleAction('variables'),
  SET_OPERATION_NAME: simpleAction('operationName'),
  SET_VARIABLE_TO_TYPE: simpleAction('variableToType'),
  SET_OPERATIONS: simpleAction('operations'),
  SET_EDITOR_FLEX: simpleAction('editorFlex'),
  EDIT_NAME: simpleAction('name'),

  OPEN_QUERY_VARIABLES: () => ({ queryVariablesActive: true }),
  CLOSE_QUERY_VARIABLES: () => ({ queryVariablesActive: false }),
  SET_VARIABLE_EDITOR_HEIGHT: simpleAction('variableEditorHeight'),
  SET_RESPONSE_TRACING_HEIGHT: simpleAction('responceTracingHeight'),
  SET_TRACING_SUPPORTED: simpleAction('tracingSupported'),
  SET_SUBSCRIPTION_ACTIVE: simpleAction('subscriptionActive'),
  SET_QUERY_TYPES: simpleAction('queryTypes'),
  SET_RESPONSE_EXTENSIONS: simpleAction('responseExtensions'),
  SET_CURRENT_QUERY_START_TIME: simpleAction('currentQueryStartTime'),
  SET_CURRENT_QUERY_END_TIME: simpleAction('currentQueryEndTime'),

  UPDATE_QUERY_FACTS: simpleAction(),
  PRETTIFY_QUERY: simpleAction(),
  INJECT_HEADERS: (headers, endpoint) => ({ headers, endpoint }),

  // setting multiple props
  /*
    this.setState({
      responseTracingOpen: false,
      responseTracingHeight: hadHeight,
    } as State)
  */
  CLOSE_TRACING: simpleAction('responseTracingHeight'),
  OPEN_TRACING: simpleAction('responseTracingHeight'),
  TOGGLE_TRACING: simpleAction(),
  // setting multiple props
  /*
    this.setState({
      responseTracingOpen: false,
      responseTracingHeight: hadHeight,
    } as State)
  */
  CLOSE_VARIABLES: simpleAction('variableEditorHeight'),
  OPEN_VARIABLES: simpleAction('variableEditorHeight'),
  TOGGLE_VARIABLES: simpleAction(),

  /*
    a littlebit more complex state mutations
  */
  ADD_RESPONSE: (workspaceId, sessionId, response) => ({
    workspaceId,
    sessionId,
    response,
  }),
  SET_RESPONSE: (workspaceId, sessionId, response) => ({
    workspaceId,
    sessionId,
    response,
  }),
  CLEAR_RESPONSES: simpleAction(),

  FETCH_SCHEMA: simpleAction(),
  REFETCH_SCHEMA: simpleAction(),
  SET_ENDPOINT_UNREACHABLE: simpleAction('endpoint'),
  SET_SCROLL_TOP: (sessionId, scrollTop) => ({ sessionId, scrollTop }),
  SCHEMA_FETCHING_SUCCESS: (endpoint, tracingSupported, isPollingSchema) => ({
    endpoint,
    tracingSupported,
    isPollingSchema,
  }),
  /*
        this.setState({
          schema,
          isReloadingSchema: false,
          endpointUnreachable: false,
          + tracingSupported
        })
  */
  SCHEMA_FETCHING_ERROR: (endpoint, error) => ({ endpoint, error }),
  /*

      this.setState({
        isReloadingSchema: false,
        endpointUnreachable: true,
      })
  */

  RENEW_STACKS: simpleAction(),
  /*
  GraphQLEditor.renewStacks()
  */

  RUN_QUERY: operationName => ({ operationName }),
  QUERY_SUCCESS: simpleAction(),
  QUERY_ERROR: simpleAction(),
  RUN_QUERY_AT_POSITION: position => ({ position }),
  START_QUERY: simpleAction('queryRunning', true),
  STOP_QUERY: (sessionId, workspaceId) => ({ workspaceId, sessionId }),
  /* GraphQLEditor.handleRunQuery */
  OPEN_SETTINGS_TAB: () => ({}),
  OPEN_CONFIG_TAB: () => ({}),
  NEW_SESSION: (endpoint, reuseHeaders) => ({ endpoint, reuseHeaders }),
  NEW_SESSION_FROM_QUERY: (query: string) => ({ query }),
  NEW_FILE_TAB: (fileName: string, filePath: string, file: string) => ({
    fileName,
    filePath,
    file,
  }),
  DUPLICATE_SESSION: simpleAction('session'),
  CLOSE_SELECTED_TAB: () => ({}),
  SELECT_NEXT_TAB: () => ({}),
  SELECT_PREV_TAB: () => ({}),
  SELECT_TAB: simpleAction('sessionId'),
  SELECT_TAB_INDEX: simpleAction('index'),
  CLOSE_TAB: simpleAction('sessionId'),
  REORDER_TABS: (src, dest) => ({ src, dest }),

  // files, settings, config
  EDIT_SETTINGS: simpleAction(),
  SAVE_SETTINGS: simpleAction(),
  EDIT_CONFIG: simpleAction(),
  SAVE_CONFIG: simpleAction(),
  EDIT_FILE: simpleAction(),
  SAVE_FILE: simpleAction(),
})

function simpleAction(key?: any, defaultValue?: any) {
  return value => ({ [key]: value || defaultValue })
}
