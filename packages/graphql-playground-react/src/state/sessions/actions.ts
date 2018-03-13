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
  schemaFetchingSuccess,
  schemaFetchingError,
  renewStacks,
  runQuery,
  prettifyQuery,
  fetchSchema,
  updateQueryFacts,
  runQueryAtPosition,
  toggleTracing,
} = createActions({
  // simple property setting
  EDIT_QUERY: simpleAction('query'),
  EDIT_HEADERS: simpleAction('headers'),
  EDIT_ENDPOINT: simpleAction('endpoint'),
  EDIT_VARIABLES: simpleAction('variables'),
  SET_OPERATION_NAME: simpleAction('operationName'),
  SET_VARIABLE_TO_TYPE: simpleAction('variableToType'),
  SET_OPERATIONS: simpleAction('operations'),
  SET_EDITOR_FLEX: simpleAction('editorFlex'),

  OPEN_QUERY_VARIABLES: simpleAction('queryVariablesActive', true),
  CLOSE_QUERY_VARIABLES: simpleAction('queryVariablesActive', false),
  SET_VARIABLE_EDITOR_HEIGHT: simpleAction('variableEditorHeight'),
  SET_RESPONSE_TRACING_HEIGHT: simpleAction('responceTracingHeight'),
  SET_TRACING_SUPPORTED: simpleAction('tracingSupported'),

  UPDATE_QUERY_FACTS: simpleAction(),
  PRETTIFY_QUERY: simpleAction(),

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

  /*
    a littlebit more complex state mutations
  */
  ADD_RESPONSE: simpleAction('response'),
  SET_RESPONSE: simpleAction('response'),
  CLEAR_RESPONSES: simpleAction(),

  FETCH_SCHEMA: simpleAction(),
  SCHEMA_FETCHING_SUCCESS: (endpoint, tracingSupported) => ({
    endpoint,
    tracingSupported,
  }),
  /*
        this.setState({
          schema,
          isReloadingSchema: false,
          endpointUnreachable: false,
          + tracingSupported
        })
  */
  SCHEMA_FETCHING_ERROR: () => ({}),
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
  RUN_QUERY_AT_POSITION: position => ({ position }),
  START_QUERY: simpleAction('queryRunning', true),
  STOP_QUERY: simpleAction('queryRunning', false),
  /* GraphQLEditor.handleRunQuery */
  OPEN_SETTINGS_TAB: () => ({}),
  OPEN_CONFIG_TAB: () => ({}),
  NEW_SESSION: (newIndex?: number) => ({ newIndex }),
  NEW_SESSION_FROM_QUERY: (query: string) => ({ query }),
  NEW_FILE_TAB: (fileName: string, filePath: string, file: string) => ({
    fileName,
    filePath,
    file,
  }),
  CLOSE_SELECTED_TAB: () => ({}),
  SELECT_NEXT_TAB: () => ({}),
  SELECT_PREV_TAB: () => ({}),
  GOTO_TAB: (index: number) => ({ index }),
  CLOSE_SESSION: simpleAction(),
})

function simpleAction(key?: any, defaultValue?: any) {
  return value => ({ [key]: value || defaultValue })
}
