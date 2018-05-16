import { Observable, FetchResult } from 'apollo-link'

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

export interface ISettings {
  ['general.betaUpdates']: boolean
  ['editor.theme']: Theme
  ['editor.reuseHeaders']: boolean
  ['tracing.hideTracingResponse']: boolean
  ['request.credentials']: 'omit' | 'include' | 'same-origin'
}
