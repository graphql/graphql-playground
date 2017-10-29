import * as React from 'react'
import { PermissionSession, ServiceInformation, Session } from '../../types'
import { GraphQLEditor } from './GraphQLEditor'
import { Header } from './HttpHeaders/HttpHeaders'
import { Viewer } from '../Playground'

export interface Props {
  session: Session
  index: number
  onRef: (index: number, ref: any) => void
  isGraphcoolUrl: boolean
  fetcher: (session: Session, graphQLParams: any) => Promise<any>
  schemaCache: any
  isEndpoint: boolean
  adminAuthToken?: string
  storage?: any
  onEditQuery: (sessionId: string, data: any) => void
  onEditVariables: (sessionId: string, variables: any) => any
  onEditOperationName: (sessionId: string, name: any) => any
  onClickCodeGeneration: any
  onChangeHeaders: (sessionId: string, headers: Header[]) => any
  autofillMutation?: () => void
  onChangeViewer: (sessionId: string, data: any) => void
  headers?: any[]
  disableQueryHeader?: boolean
  disableResize?: boolean
  responses?: any
  useVim: boolean
  isActive: boolean

  onboardingStep?: any
  tether?: any
  nextStep?: () => void
  permission?: PermissionSession
  serviceInformation?: ServiceInformation
}

export default class GraphQLEditorSession extends React.PureComponent<
  Props,
  {}
> {
  fetcher = graphQLParams => {
    return this.props.fetcher(this.props.session, graphQLParams)
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
      onboardingStep,
      tether,
      nextStep,
      isActive,
      permission,
      serviceInformation,
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
        selectedViewer={session.selectedViewer}
        storage={storage}
        query={session.query}
        variables={session.variables}
        operationName={session.operationName}
        headers={session.headers}
        onClickCodeGeneration={this.props.onClickCodeGeneration}
        onChangeViewer={this.handleViewerChange}
        onEditOperationName={this.handleOperationNameChange}
        onEditVariables={this.handleVariableChange}
        onEditQuery={this.handleQueryChange}
        onChangeHeaders={this.handleChangeHeaders}
        responses={responses}
        disableQueryHeader={disableQueryHeader}
        disableResize={true}
        onboardingStep={onboardingStep}
        tether={tether}
        nextStep={nextStep}
        ref={this.setRef}
        autofillMutation={this.props.autofillMutation}
        useVim={this.props.useVim}
        rerenderQuery={
          this.props.onboardingStep === 'STEP3_ENTER_MUTATION1_VALUES' ||
          this.props.onboardingStep === 'STEP3_ENTER_MUTATION2_VALUE'
        }
        disableAnimation={true}
        disableAutofocus={!isActive}
        permission={permission}
        serviceInformation={serviceInformation}
      />
    )
  }

  private setRef = (ref: any) => {
    this.props.onRef(this.props.index, ref)
  }

  private handleViewerChange = (viewer: Viewer) => {
    this.props.onChangeViewer(this.props.session.id, viewer)
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
