import * as React from 'react'
import { ServiceInformation, Session } from '../../types'
import GraphQLEditor from './GraphQLEditor'
import { Header } from './HttpHeaders/HttpHeaders'

export interface Props {
  session: Session
  index: number
  onRef: (index: number, ref: any) => void
  isGraphcoolUrl: boolean
  fetcher: (session: Session, graphQLParams: any, headers?: any) => Promise<any>
  schemaCache: any
  isEndpoint: boolean
  adminAuthToken?: string
  storage?: any
  onEditQuery: (sessionId: string, data: any) => void
  onEditVariables: (sessionId: string, variables: any) => any
  onEditOperationName: (sessionId: string, name: any) => any
  onClickCodeGeneration: any
  onChangeHeaders: (sessionId: string, headers: Header[]) => any
  headers?: any[]
  disableQueryHeader?: boolean
  disableResize?: boolean
  responses?: any
  useVim: boolean
  isActive: boolean

  serviceInformation?: ServiceInformation
  tracingSupported: boolean
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
      schemaCache,
      adminAuthToken,
      isEndpoint,
      storage,
      responses,
      disableQueryHeader,
      isActive,
      serviceInformation,
      tracingSupported,
    } = this.props
    return (
      <GraphQLEditor
        isActive={isActive}
        key={session.id}
        isGraphcoolUrl={isGraphcoolUrl}
        schema={schemaCache}
        fetcher={this.fetcher}
        showQueryTitle={false}
        showResponseTitle={false}
        showViewAs={Boolean(adminAuthToken)}
        showSelectUser={Boolean(this.props.adminAuthToken)}
        showEndpoints={!isEndpoint}
        showDownloadJsonButton={true}
        showCodeGeneration={true}
        storage={storage}
        query={session.query}
        variables={session.variables}
        operationName={session.operationName}
        headers={session.headers}
        onClickCodeGeneration={this.props.onClickCodeGeneration}
        onEditOperationName={this.handleOperationNameChange}
        onEditVariables={this.handleVariableChange}
        onEditQuery={this.handleQueryChange}
        onChangeHeaders={this.handleChangeHeaders}
        responses={responses}
        disableQueryHeader={disableQueryHeader}
        disableResize={true}
        ref={this.setRef}
        useVim={this.props.useVim}
        rerenderQuery={false}
        disableAnimation={true}
        disableAutofocus={!isActive}
        serviceInformation={serviceInformation}
        tracingSupported={tracingSupported}
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

  private handleChangeHeaders = (headers: any[]) => {
    this.props.onChangeHeaders(this.props.session.id, headers)
  }
}
