import * as React from 'react'
import { Session, ISettings, ApolloLinkExecuteResponse } from '../../types'
import GraphQLEditor from './GraphQLEditor'
import { SchemaFetcher } from './SchemaFetcher'
import { SharingProps } from '../Share'
import { GraphQLRequest, Observable, FetchResult } from 'apollo-link'

export interface Props {
  session: Session
  index: number
  onRef: (index: number, ref: any) => void
  isGraphcoolUrl: boolean
  fetcher: (
    session: Session,
    graphQLRequest: GraphQLRequest,
  ) => ApolloLinkExecuteResponse
  schemaFetcher: SchemaFetcher
  isEndpoint: boolean
  storage?: any
  onEditQuery: (sessionId: string, data: any) => void
  onEditVariables: (sessionId: string, variables: any) => any
  onEditOperationName: (sessionId: string, name: any) => any
  onChangeHeaders: (sessionId: string, headers: string) => any
  onClickHistory: () => void
  onChangeEndpoint: (sessionId: string, value: string) => void
  onClickShare: (sessionId: string) => void
  onStopQuery: (sessionId: string) => void
  headers?: any[]
  disableQueryHeader?: boolean
  disableResize?: boolean
  responses?: any
  useVim: boolean
  isActive: boolean
  sharing: SharingProps
  fixedEndpoint?: boolean
  endpoint: string
  settings: ISettings
}

export default class GraphQLEditorSession extends React.PureComponent<
  Props,
  {}
> {
  fetcher = (graphQLRequest: GraphQLRequest): Observable<FetchResult> => {
    return this.props.fetcher(this.props.session, graphQLRequest)
  }
  render() {
    const {
      session,
      schemaFetcher,
      sharing,
      fixedEndpoint,
      endpoint,
    } = this.props
    return (
      <GraphQLEditor
        endpoint={endpoint}
        key={session.id}
        fetcher={this.fetcher}
        onEditOperationName={this.handleOperationNameChange}
        onEditVariables={this.handleVariableChange}
        onEditQuery={this.handleQueryChange}
        onChangeHeaders={this.handleChangeHeaders}
        onRef={this.setRef}
        useVim={this.props.useVim}
        session={session}
        schemaFetcher={schemaFetcher}
        onClickHistory={this.handleClickHistory}
        onChangeEndpoint={this.handleChangeEndpoint}
        onClickShare={this.handleClickShare}
        onStopQuery={this.handleStopQuery}
        sharing={sharing}
        fixedEndpoint={fixedEndpoint}
        shouldHideTracingResponse={this.shouldHideTracingResponse()}
      />
    )
  }

  private setRef = (ref: any) => {
    this.props.onRef(this.props.index, ref)
  }

  private handleOperationNameChange = (name: string) => {
    this.props.onEditOperationName(this.props.session.id, name)
  }

  private handleVariableChange = (variables: string) => {
    this.props.onEditVariables(this.props.session.id, variables)
  }

  private handleQueryChange = (query: string) => {
    this.props.onEditQuery(this.props.session.id, query)
  }

  private handleChangeHeaders = (headers: string) => {
    this.props.onChangeHeaders(this.props.session.id, headers)
  }

  private handleClickHistory = () => {
    this.props.onClickHistory()
  }

  private handleChangeEndpoint = (endpoint: string) => {
    this.props.onChangeEndpoint(this.props.session.id, endpoint)
  }

  private handleClickShare = () => {
    this.props.onClickShare(this.props.session.id)
  }

  private handleStopQuery = () => {
    this.props.onStopQuery(this.props.session.id)
  }

  private shouldHideTracingResponse = (): boolean => {
    return this.props.settings['tracing.hideTracingResponse']
  }
}
