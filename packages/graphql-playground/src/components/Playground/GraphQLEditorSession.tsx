import * as React from 'react'
import { Session } from '../../types'
import GraphQLEditor from './GraphQLEditor'
import { SchemaFetcher } from './SchemaFetcher'
import { SharingProps } from '../Share'

export interface Props {
  session: Session
  index: number
  onRef: (index: number, ref: any) => void
  isGraphcoolUrl: boolean
  fetcher: (session: Session, graphQLParams: any, headers?: any) => Promise<any>
  schemaFetcher: SchemaFetcher
  isEndpoint: boolean
  storage?: any
  onEditQuery: (sessionId: string, data: any) => void
  onEditVariables: (sessionId: string, variables: any) => any
  onEditOperationName: (sessionId: string, name: any) => any
  onClickCodeGeneration: any
  onChangeHeaders: (sessionId: string, headers: string) => any
  onClickHistory: () => void
  onChangeEndpoint: (sessionId: string, value: string) => void
  onClickShare: (sessionId: string) => void
  headers?: any[]
  disableQueryHeader?: boolean
  disableResize?: boolean
  responses?: any
  useVim: boolean
  isActive: boolean
  sharing?: SharingProps
}

export default class GraphQLEditorSession extends React.PureComponent<
  Props,
  {}
> {
  fetcher = (graphQLParams, headers?: any) => {
    return this.props.fetcher(this.props.session, graphQLParams, headers)
  }
  render() {
    const {
      session,
      isGraphcoolUrl,
      isEndpoint,
      storage,
      responses,
      disableQueryHeader,
      isActive,
      schemaFetcher,
      sharing,
    } = this.props
    return (
      <GraphQLEditor
        isActive={isActive}
        key={session.id}
        isGraphcoolUrl={isGraphcoolUrl}
        fetcher={this.fetcher}
        showQueryTitle={false}
        showResponseTitle={false}
        showEndpoints={!isEndpoint}
        showDownloadJsonButton={true}
        showCodeGeneration={true}
        storage={storage}
        query={session.query}
        variables={session.variables}
        operationName={session.operationName}
        onClickCodeGeneration={this.props.onClickCodeGeneration}
        onEditOperationName={this.handleOperationNameChange}
        onEditVariables={this.handleVariableChange}
        onEditQuery={this.handleQueryChange}
        onChangeHeaders={this.handleChangeHeaders}
        responses={responses}
        disableQueryHeader={disableQueryHeader}
        disableResize={false}
        ref={this.setRef}
        useVim={this.props.useVim}
        rerenderQuery={false}
        disableAnimation={true}
        disableAutofocus={!isActive}
        session={session}
        schemaFetcher={schemaFetcher}
        onClickHistory={this.handleClickHistory}
        onChangeEndpoint={this.handleChangeEndpoint}
        onClickShare={this.handleClickShare}
        sharing={sharing}
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
}
