import { createActions } from 'redux-actions'

export const {
  editQuery,
  editVariables,
  editOperationName,
  editHeaders,
  editEndpoint,
  startQuery,
  stopQuery,
  setEditorFlex,
  selectQueryVariables,
  unselectQueryVariables,
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
} = createActions({
  // simple property setting
  EDIT_QUERY: simpleAction('query'),
  EDIT_VARIABLES: simpleAction('variables'),
  EDIT_OPERATION_NAME: simpleAction('operationName'),
  EDIT_HEADERS: simpleAction('headers'),
  EDIT_ENDPOINT: simpleAction('endpoint'),
  SET_EDITOR_FLEX: simpleAction('editorFlex'),
  SELECT_QUERY_VARIABLES: simpleAction('queryVariablesActive', true),
  UNSELECT_QUERY_VARIABLES: simpleAction('queryVariablesActive', false),

  // setting multiple props
  /*
    this.setState({
      responseTracingOpen: false,
      responseTracingHeight: hadHeight,
    } as State)
  */
  CLOSE_TRACING: simpleAction('responseTracingHeight'),
  OPEN_TRACING: simpleAction('responseTracingHeight'),
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

  RUN_QUERY: (sessionId, operationName) => ({ sessionId, operationName }),
  START_QUERY: simpleAction('queryRunning', true),
  STOP_QUERY: simpleAction('queryRunning', false),
  /* GraphQLEditor.handleRunQuery */
})

function simpleAction(key?: any, defaultValue?: any) {
  return (sessionId, value) => ({ sessionId, [key]: value || defaultValue })
}
