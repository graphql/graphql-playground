import { Observable, FetchResult } from 'apollo-link'

export interface Session {
  id: string
  endpoint: string

  query: string
  file?: string
  variables: string
  responses?: Response[]
  operationName?: string
  queryRunning: boolean
  subscriptionActive: boolean
  operations: OperationDefinition[]

  // additional props that are interactive in graphiql, these are not represented in graphiqls state
  queryTypes: QueryTypes
  date: Date
  hasMutation: boolean
  hasSubscription: boolean
  hasQuery: boolean

  isFile?: boolean
  starred?: boolean
  name?: string
  filePath?: string
  selectedUserToken?: string
  headers?: string
  hasChanged?: boolean
  absolutePath?: string
  isSettingsTab?: boolean
  isConfigTab?: boolean

  currentQueryStartTime?: Date
  currentQueryEndTime?: Date

  isReloadingSchema: boolean

  responseExtensions: any
  queryVariablesActive: boolean
  endpointUnreachable: boolean
  selectedVariableNames: string[]

  // editor settings
  editorFlex: number
  variableEditorOpen: boolean
  variableEditorHeight: number
  responseTracingOpen: boolean
  responseTracingHeight: number
  docExplorerWidth: number
  nextQueryStartTime?: Date
  tracingSupported?: boolean
}

export interface QueryTypes {
  firstOperationName: string | null
  subscription: boolean
  query: boolean
  mutation: boolean
  permission?: boolean
  // operations: OperationDefinition[]
}

export interface OperationDefinition {
  startLine: number
  endLine: number
  name: string
}

export type ApolloLinkExecuteResponse = Observable<FetchResult>

export type HistoryFilter = 'HISTORY' | 'STARRED'

export type Environment = 'Node' | 'Browser' | 'Cli'
export type GraphQLClient =
  | 'fetch'
  | 'relay'
  | 'apollo'
  | 'graphql-request'
  | 'curl'

export type Theme = 'dark' | 'light'
export interface Response {
  resultID: string
  date: string
  time: Date
}

export interface ISettings {
  ['general.betaUpdates']: boolean
  ['editor.theme']: Theme
  ['editor.reuseHeaders']: boolean
  ['tracing.hideTracingResponse']: boolean
}
