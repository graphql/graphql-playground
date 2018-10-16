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

export type CursorShape = 'line' | 'block' | 'underline'

export interface ISettings {
  ['general.betaUpdates']: boolean
  ['editor.cursorShape']: CursorShape
  ['editor.fontFamily']: string
  ['editor.fontSize']: number
  ['editor.theme']: Theme
  ['editor.reuseHeaders']: boolean
  ['prettier.printWidth']: number
  ['tracing.hideTracingResponse']: boolean
  ['request.credentials']: 'omit' | 'include' | 'same-origin'
}
