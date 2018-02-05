import { Observable, FetchResult } from 'apollo-link'

export interface Session {
  id: string
  name?: string
  filePath?: string

  query: string
  file?: string
  variables: string
  result?: string
  // result: string
  operationName?: string
  subscriptionActive: boolean

  // additional props that are interactive in graphiql, these are not represented in graphiqls state
  isFile?: boolean
  queryTypes: QueryTypes
  starred?: boolean
  date: Date
  hasMutation: boolean
  hasSubscription: boolean
  hasQuery: boolean
  selectedUserToken?: string
  subscriptionId?: string
  headers?: string
  hasChanged?: boolean
  absolutePath?: string
  endpoint: string
  isSettingsTab?: boolean
  isConfigTab?: boolean
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
