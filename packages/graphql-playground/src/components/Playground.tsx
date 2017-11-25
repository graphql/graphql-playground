import * as React from 'react'
import { GraphQLEditor } from './Playground/GraphQLEditor'
import * as fetch from 'isomorphic-fetch'
import { buildClientSchema, GraphQLList, GraphQLObjectType } from 'graphql'
import { TabBar } from './Playground/TabBar'
import { defaultQuery, introspectionQuery } from '../constants'
import { PermissionSession, ServiceInformation, Session } from '../types'
import * as cuid from 'cuid'
import * as Immutable from 'seamless-immutable'
import OldThemeProvider from './Theme/ThemeProvider'
import PlaygroundStorage from './PlaygroundStorage'
import getQueryTypes from './Playground/util/getQueryTypes'
import debounce from 'graphiql/dist/utility/debounce'
import { Observable } from 'rxjs/Observable'
import { SubscriptionClient } from 'subscriptions-transport-ws'
import isQuerySubscription from './Playground/util/isQuerySubscription'
import HistoryPopup from './HistoryPopup'
import * as cx from 'classnames'
import SelectUserPopup from './SelectUserPopup'
import calc from 'calculate-size'
import CodeGenerationPopup from './CodeGenerationPopup/CodeGenerationPopup'
import GraphDocs from './Playground/DocExplorer/GraphDocs'
import {
  onboardingEmptyMutation,
  onboardingFilledMutation1,
  onboardingFilledMutation2,
  onboardingQuery1,
  onboardingQuery1Check,
} from '../data'
import Settings from './Settings'
import { connect } from 'react-redux'
import { DocsState } from '../reducers/graphiql-docs'
import GraphQLEditorSession from './Playground/GraphQLEditorSession'
import {
  getElementIndex,
  getRootMap,
  getDeeperType,
} from './Playground/DocExplorer/utils'
import { setStacks } from '../actions/graphiql-docs'
import { isEqual, mapValues } from 'lodash'
import Share from './Share'
import NewPermissionTab from './Permissions/NewPermissionTab'
import { serviceInformationQuery } from './constants'
import styled, { ThemeProvider, theme as styledTheme } from '../styled'

export type Theme = 'dark' | 'light'
export type Viewer = 'ADMIN' | 'EVERYONE' | 'USER'
export interface Response {
  resultID: string
  date: string
  time: Date
}

export interface Props {
  endpoint: string
  subscriptionsEndpoint?: string
  projectId?: string
  adminAuthToken?: string
  onSuccess?: (graphQLParams: any, response: any) => void
  isEndpoint?: boolean
  onboardingStep?: string
  tether?: any
  nextStep?: () => void
  isApp?: boolean
  setStacks?: (stack: any[]) => void
  onChangeEndpoint?: (endpoint: string) => void
  share: (state: any) => void
  shareUrl?: string
  session?: any
  onChangeSubscriptionsEndpoint?: (endpoint: string) => void
  getRef?: (ref: Playground) => void
}

export interface State {
  schema: any
  sessions: Session[]
  selectedSessionIndex: number
  schemaCache: any
  permissionSchema?: any
  historyOpen: boolean
  history: Session[]
  adminAuthToken?: string
  response?: Response
  selectUserOpen: boolean
  userFields: string[]
  selectUserSessionId?: string
  codeGenerationPopupOpen: boolean
  disableQueryHeader: boolean
  theme: Theme
  autoReloadSchema: boolean
  useVim: boolean
  userModelName: string

  shareAllTabs: boolean
  shareHttpHeaders: boolean
  shareHistory: boolean
  changed: boolean
  serviceInformation?: ServiceInformation
  tracingSupported: boolean
}

export interface CursorPosition {
  line: number
  ch: number
}

export { GraphQLEditor }

export class Playground extends React.PureComponent<Props & DocsState, State> {
  storage: PlaygroundStorage
  wsConnections: { [sessionId: string]: any } = {}
  observers: { [sessionId: string]: any } = {}
  graphiqlComponents: any[] = []
  private initialIndex: number = -1
  private schemaReloadInterval: any
  private rawSchemaCache: any = null

  private updateQueryTypes = debounce(
    150,
    (sessionId: string, query: string) => {
      const queryTypes = getQueryTypes(query)
      this.setValueInSession(sessionId, 'queryTypes', queryTypes)
    },
  )

  private handleQueryChange = debounce(
    300,
    (sessionId: string, query: string) => {
      this.setValueInSession(sessionId, 'query', query)
      this.setValueInSession(sessionId, 'hasChanged', true)
      this.updateQueryTypes(sessionId, query)
      if (
        this.props.onboardingStep === 'STEP3_UNCOMMENT_DESCRIPTION' &&
        this.state.selectedSessionIndex === 0
      ) {
        const trimmedQuery = query.replace(/\s/g, '').replace(',', '')
        if (
          trimmedQuery === onboardingQuery1Check &&
          typeof this.props.nextStep === 'function'
        ) {
          this.props.nextStep()
        }
      }

      if (
        (this.props.onboardingStep === 'STEP3_ENTER_MUTATION1_VALUES' ||
          this.props.onboardingStep === 'STEP3_ENTER_MUTATION2_VALUE') &&
        this.state.selectedSessionIndex === 1
      ) {
        const trimmedTemplate = onboardingEmptyMutation.replace(/\s/g, '')
        const trimmedQuery = query.replace(/\s/g, '').replace(',', '')
        if (
          trimmedQuery !== trimmedTemplate &&
          typeof this.props.nextStep === 'function'
        ) {
          this.props.nextStep()
        }
      }
    },
  )

  constructor(props) {
    super(props)
    this.storage = new PlaygroundStorage(props.endpoint)
    if (props.session) {
      this.storage.setState(props.session)
    }

    const sessions = this.initSessions()

    const selectedSessionIndex =
      parseInt(this.storage.getItem('selectedSessionIndex'), 10) || 0

    this.state = {
      schema: null,
      schemaCache: null,
      userFields: [],
      sessions,
      selectedSessionIndex:
        selectedSessionIndex < sessions.length && selectedSessionIndex > -1
          ? selectedSessionIndex
          : 0,
      historyOpen: false,
      history: this.storage.getHistory(),
      adminAuthToken:
        (props.adminAuthToken &&
          props.adminAuthToken.length > 0 &&
          props.adminAuthToken) ||
        localStorage.getItem('token'),
      selectUserOpen: false,
      selectUserSessionId: undefined,
      codeGenerationPopupOpen: false,
      disableQueryHeader: false,
      theme: (localStorage.getItem('theme') as Theme) || 'dark',
      autoReloadSchema: false,
      useVim: localStorage.getItem('useVim') === 'true' || false,
      shareAllTabs: true,
      shareHttpHeaders: true,
      shareHistory: true,
      changed: false,
      response: undefined,
      userModelName: 'User',
      tracingSupported: false,
    }

    if (typeof window === 'object') {
      window.addEventListener('beforeunload', () => {
        this.componentWillUnmount()
      })
    }
    ;(global as any).p = this
    this.fetcher = this.fetcher.bind(this)

    if (typeof this.props.getRef === 'function') {
      this.props.getRef(this)
    }
  }

  componentWillMount() {
    // look, if there is a session. if not, initiate one.
    this.fetchSchemas().then(this.initSessions)
  }

  componentDidMount() {
    if (this.initialIndex > -1) {
      this.setState({
        selectedSessionIndex: this.initialIndex,
      } as State)
    }
    if (
      ['STEP3_UNCOMMENT_DESCRIPTION', 'STEP3_OPEN_PLAYGROUND'].indexOf(
        this.props.onboardingStep || '',
      ) > -1
    ) {
      this.setCursor({ line: 3, ch: 6 })
    }
    this.initWebsockets()
    if (this.props.adminAuthToken) {
      this.fetchPermissionSchema()
      this.fetchServiceInformation()
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (
      prevProps.endpoint !== this.props.endpoint ||
      prevProps.adminAuthToken !== this.props.adminAuthToken ||
      prevProps.subscriptionsEndpoint !== this.props.subscriptionsEndpoint
    ) {
      this.saveSessions()
      this.saveHistory()
      this.storage.saveProject()
      this.storage = new PlaygroundStorage(this.props.endpoint)
      const sessions = this.initSessions()
      this.setState(
        {
          sessions,
          history: this.storage.getHistory(),
        },
        () => {
          this.resetSubscriptions()
          this.fetchSchemas().then(this.initSessions)
        },
      )
    }

    if (this.state.autoReloadSchema && !this.schemaReloadInterval) {
      this.fetchSchemas()
      this.schemaReloadInterval = window.setInterval(() => {
        this.fetchSchemas()
      }, 4000)
    }

    if (!this.state.autoReloadSchema && this.schemaReloadInterval) {
      window.clearInterval(this.schemaReloadInterval)
      this.schemaReloadInterval = null
    }
  }

  fetchSchemas = () => {
    const additionalHeaders = {}

    const headers = this.state.sessions[this.state.selectedSessionIndex].headers

    if (headers) {
      headers.forEach(header => (additionalHeaders[header.name] = header.value))
    }

    return this.fetchSchema(this.getSimpleEndpoint(), additionalHeaders).then(
      simpleSchemaData => {
        if (!simpleSchemaData || simpleSchemaData.error) {
          const errorMessage = `Schema could not be fetched.\nPlease check if the endpoint '${this.getSimpleEndpoint()}' is a valid GraphQL Endpoint.`
          this.setState({
            response: {
              date:
                simpleSchemaData && simpleSchemaData.error
                  ? simpleSchemaData.error
                  : errorMessage,
              time: new Date(),
            },
          } as State)
          return
        }

        if (isEqual(this.rawSchemaCache, simpleSchemaData.data)) {
          return
        }

        this.rawSchemaCache = simpleSchemaData.data

        if (!simpleSchemaData.data) {
          return
        }

        const simpleSchema = buildClientSchema(simpleSchemaData.data)
        const userFields = this.extractUserField(simpleSchema)

        this.renewStack(simpleSchema)

        const tracingSupported =
          simpleSchemaData.extensions && simpleSchemaData.extensions.tracing
        this.setState({
          schemaCache: simpleSchema,
          userFields,
          tracingSupported,
        } as State)
      },
    )
  }

  componentWillUnmount() {
    this.storage.setItem(
      'selectedSessionIndex',
      String(this.state.selectedSessionIndex),
    )
    this.saveSessions()
    this.saveHistory()
    this.storage.saveProject()
  }

  setWS = (session: Session) => {
    const connectionParams: any = {}

    if (session.headers) {
      session.headers.forEach(header => {
        connectionParams[header.name] = header.value
      })
    }

    if (session.selectedViewer === 'ADMIN' && this.state.adminAuthToken) {
      connectionParams.Authorization = `Bearer ${this.state.adminAuthToken}`
    } else if (session.selectedViewer === 'USER' && session.selectedUserToken) {
      connectionParams.Authorization = `Bearer ${session.selectedUserToken}`
    }

    if (this.wsConnections[session.id]) {
      this.wsConnections[session.id].unsubscribeAll()
    }

    const endpoint = this.getWSEndpoint()
    if (endpoint) {
      try {
        this.wsConnections[session.id] = new SubscriptionClient(endpoint, {
          timeout: 20000,
          connectionParams,
        })
      } catch (e) {
        /* tslint:disable-next-line */
        console.error(e)
      }
    }
  }
  initWebsockets() {
    this.state.sessions.forEach(session => this.setWS(session))
  }
  setCursor(position: CursorPosition) {
    const editor = this.graphiqlComponents[this.state.selectedSessionIndex]
      .queryEditorComponent.editor
    editor.setCursor(position)
  }
  renewStack(schema) {
    const rootMap = getRootMap(schema)
    const stacks = this.props.navStack
      .map(stack => {
        return this.getNewStack(rootMap, schema, stack)
      })
      .filter(s => s)
    this.props.setStacks!(stacks)
  }
  getNewStack(root, schema, stack) {
    const path = stack.field.path
    const splittedPath = path.split('/')
    let pointer: any = null
    let count = 0
    let lastPointer: any = null
    let y = -1
    while (splittedPath.length > 0) {
      const currentPath: string = splittedPath.shift()!
      if (count === 0) {
        pointer = root[currentPath]
        y = Object.keys(root).indexOf(currentPath)
      } else {
        const argFound = pointer.args.find(arg => arg.name === currentPath)
        lastPointer = pointer
        if (argFound) {
          pointer = argFound
        } else {
          if (pointer.type.ofType) {
            pointer = getDeeperType(pointer.type.ofType)
          }
          if (pointer.type) {
            pointer = pointer.type
          }
          pointer =
            pointer.getFields()[currentPath] ||
            pointer.getInterfaces().find(i => i.name === currentPath)
        }
      }
      if (lastPointer) {
        y = getElementIndex(schema, lastPointer, pointer)
      }
      count++
    }

    if (!pointer) {
      return null
    }

    pointer.path = path
    pointer.parent = lastPointer

    return {
      ...stack,
      y,
      field: pointer,
    }
  }
  extractUserField(simpleSchema, userModelName?: string) {
    const modelName = userModelName || this.state.userModelName
    const userSchema = simpleSchema.getType(modelName)
    if (userSchema) {
      const userSchemaFields = userSchema.getFields()
      const userFields = Object.keys(userSchemaFields)
        .map(fieldName => userSchemaFields[fieldName])
        .filter(field => {
          // filter password, meta fields and relation fields
          return (
            field.name[0] !== '_' &&
            field.name !== 'password' &&
            !(
              field.type instanceof GraphQLList ||
              field.type instanceof GraphQLObjectType
            )
          )
        })

      // put id to beginning
      userFields.sort((a, b) => {
        if (a.name === 'id') {
          return -1
        }
        if (b.name === 'id') {
          return 1
        }

        return a.name > b.name ? 1 : -1
      })

      return userFields.map(field => {
        const size = calc(field.name, {
          font: 'Open Sans',
          fontWeight: '600',
          fontSize: '16px',
        })
        let width = size.width
        if (field.name === 'id') {
          width = 220
        }
        // TODO create type to field width map
        field.width = Math.max(width, 185) + 50

        return field
      })
    } else {
      return []
    }
  }

  fetchPermissionSchema() {
    const headers = {
      Authorization: `Bearer ${this.props.adminAuthToken}`,
    }
    this.fetchSchema(this.getPermissionEndpoint(), headers)
      .then(schema => {
        const permissionSchema = buildClientSchema(schema.data)
        this.setState({
          permissionSchema,
        })
      })
      .catch(error => {
        /* tslint:disable-next-line */
        console.error(error)
      })
  }

  fetchServiceInformation() {
    const systemApi = this.getSystemEndpoint()
    const id = this.extractServiceId()
    fetch(systemApi, {
      method: 'post',
      body: JSON.stringify({
        query: serviceInformationQuery,
        variables: { id },
      }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.state.adminAuthToken}`,
      },
    })
      .then(res => res.json())
      .then(res => {
        if (res.data.viewer.project) {
          const { models, relations } = res.data.viewer.project

          this.setState({
            serviceInformation: {
              relations: relations.edges.map(edge => edge.node),
              models: models.edges.map(edge => edge.node),
            },
            userModelName: models.edges[0]!.node.name!,
          })
        } else {
          /* tslint:disable-next-line */
          console.error('Error while fetching service information', res)
        }
      })
  }

  getModelNames(): string[] {
    if (this.state.serviceInformation) {
      return this.state.serviceInformation.models.map(m => m.name)
    }

    return []
  }

  extractServiceId() {
    return this.props.endpoint.split('/').slice(-1)[0]
  }

  getPermissionEndpoint() {
    return this.props.endpoint + '/permissions'
  }

  fetchSchema(endpointUrl: string, headers: any = {}) {
    return fetch(endpointUrl, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'X-Apollo-Tracing': '1',
        ...headers,
      },
      body: JSON.stringify({ query: introspectionQuery }),
    })
      .then(response => {
        return response.json()
      })
      .catch(e => {
        this.setState({
          response: {
            date: `Error: Could not fetch schema from ${
              endpointUrl
            }. Make sure the url is correct.`,
            time: new Date(),
            resultID: cuid(),
          },
        })
      })
  }

  render() {
    const { sessions, selectedSessionIndex, theme } = this.state
    const { isEndpoint } = this.props
    // {
    //   'blur': this.state.historyOpen,
    // },
    if (this.state.selectUserOpen && !this.props.adminAuthToken) {
      throw new Error(
        'The "Select User" Popup is open, but no admin token is provided.',
      )
    }
    const selectedEndpointUrl = isEndpoint
      ? location.href
      : this.getSimpleEndpoint()
    const isGraphcoolUrl = this.isGraphcoolUrl(selectedEndpointUrl)
    return (
      <ThemeProvider theme={{ ...styledTheme, mode: theme }}>
        <OldThemeProvider theme={this.state.theme}>
          <PlaygroundWrapper className="playground">
            <TabBar
              sessions={sessions}
              selectedSessionIndex={selectedSessionIndex}
              onNewSession={this.handleNewSessionWithoutNewIndexZero}
              onCloseSession={this.handleCloseSession}
              onOpenHistory={this.handleOpenHistory}
              onSelectSession={this.handleSelectSession}
              onboardingStep={this.props.onboardingStep}
              nextStep={this.props.nextStep}
              tether={this.props.tether}
              isApp={this.props.isApp}
            />
            <GraphiqlsContainer
              className={cx('graphiqls-container', {
                'docs-graphiql': theme === 'light',
              })}
            >
              {sessions.map((session, index) => (
                <GraphiqlWrapper
                  key={session.id}
                  className={cx('graphiql-wrapper', {
                    active: index === selectedSessionIndex,
                  })}
                  style={{
                    top: `-${100 * selectedSessionIndex}%`,
                  }}
                >
                  <GraphQLEditorSession
                    key={session.id}
                    session={session}
                    index={index}
                    schemaCache={
                      session.permission
                        ? this.state.permissionSchema
                        : this.state.schemaCache
                    }
                    isGraphcoolUrl={isGraphcoolUrl}
                    fetcher={
                      session.permission ? this.permissionFetcher : this.fetcher
                    }
                    adminAuthToken={this.props.adminAuthToken}
                    isEndpoint={Boolean(isEndpoint)}
                    storage={this.storage.getSessionStorage(session.id)}
                    onClickCodeGeneration={this.handleClickCodeGeneration}
                    onChangeViewer={this.handleViewerChange}
                    onEditOperationName={this.handleOperationNameChange}
                    onEditVariables={this.handleVariableChange}
                    onEditQuery={this.handleQueryChange}
                    onChangeHeaders={this.handleChangeHeaders}
                    responses={
                      this.state.response ? [this.state.response] : undefined
                    }
                    disableQueryHeader={this.state.disableQueryHeader}
                    onboardingStep={
                      index === selectedSessionIndex
                        ? this.props.onboardingStep
                        : undefined
                    }
                    tether={this.props.tether}
                    nextStep={this.props.nextStep}
                    onRef={this.setRef}
                    autofillMutation={this.autofillMutation}
                    useVim={this.state.useVim && index === selectedSessionIndex}
                    isActive={index === selectedSessionIndex}
                    permission={session.permission}
                    serviceInformation={this.state.serviceInformation}
                    tracingSupported={Boolean(this.state.tracingSupported)}
                  />
                </GraphiqlWrapper>
              ))}
            </GraphiqlsContainer>
            <Settings
              onToggleTheme={this.toggleTheme}
              localTheme={this.state.theme}
              autoReload={this.state.autoReloadSchema}
              onToggleReload={this.toggleSchemaReload}
              onReload={this.fetchSchemas}
              endpoint={this.props.endpoint}
              onChangeEndpoint={this.props.onChangeEndpoint}
              useVim={this.state.useVim}
              onToggleUseVim={this.toggleUseVim}
              subscriptionsEndpoint={this.props.subscriptionsEndpoint || ''}
              onChangeSubscriptionsEndpoint={
                this.props.onChangeSubscriptionsEndpoint
              }
            />
            {this.props.adminAuthToken &&
              this.state.serviceInformation && (
                <NewPermissionTab
                  serviceInformation={this.state.serviceInformation}
                  localTheme={this.state.theme}
                  onNewPermissionTab={this.handleNewPermissionTab}
                />
              )}
            <Share
              localTheme={this.state.theme}
              onShare={this.share}
              onToggleHistory={this.toggleShareHistory}
              onToggleAllTabs={this.toggleShareAllTabs}
              onToggleHttpHeaders={this.toggleShareHTTPHeaders}
              history={this.state.shareHistory}
              allTabs={this.state.shareAllTabs}
              httpHeaders={this.state.shareHttpHeaders}
              shareUrl={this.props.shareUrl}
              reshare={this.state.changed}
              isSharingAuthorization={this.isSharingAuthorization()}
            />
            <GraphDocs schema={this.state.schemaCache} />
            {this.state.historyOpen && (
              <HistoryPopup
                isOpen={this.state.historyOpen}
                onRequestClose={this.handleCloseHistory}
                historyItems={this.state.history}
                onItemStarToggled={this.handleItemStarToggled}
                fetcherCreater={this.fetcher}
                schema={this.state.schemaCache}
                onCreateSession={this.handleCreateSession}
                isGraphcool={isGraphcoolUrl}
              />
            )}
            {this.props.adminAuthToken &&
              this.state.selectUserOpen &&
              this.renderUserPopup()}
            {this.state.codeGenerationPopupOpen &&
              this.renderCodeGenerationPopup()}
          </PlaygroundWrapper>
        </OldThemeProvider>
      </ThemeProvider>
    )
  }

  renderUserPopup() {
    return (
      <SelectUserPopup
        isOpen={this.state.selectUserOpen}
        onRequestClose={this.handleCloseSelectUser}
        adminAuthToken={this.props.adminAuthToken!}
        userFields={this.state.userFields}
        onSelectUser={this.handleUserSelection}
        endpointUrl={this.getSimpleEndpoint()}
        modelNames={this.getModelNames()}
        userModelName={this.state.userModelName}
        onChangeUserModelName={this.handleUserModelChange}
      />
    )
  }

  handleUserModelChange = (userModelName: string) => {
    const userFields = this.extractUserField(
      this.state.schemaCache,
      userModelName,
    )

    this.setState({
      userModelName,
      userFields,
    })
  }

  renderCodeGenerationPopup() {
    const { sessions, selectedSessionIndex } = this.state
    const { isEndpoint } = this.props
    const selectedSession = sessions[selectedSessionIndex]
    const selectedEndpointUrl = isEndpoint
      ? location.href
      : this.getSimpleEndpoint()
    return (
      <CodeGenerationPopup
        endpointUrl={selectedEndpointUrl}
        isOpen={this.state.codeGenerationPopupOpen}
        onRequestClose={this.handleCloseCodeGeneration}
        query={selectedSession.query}
      />
    )
  }

  getDefaultPermissionQuery(session: PermissionSession) {
    const modelName = session.relationName
      ? this.state.serviceInformation!.relations.find(
          r => r.name === session.relationName,
        )!.leftModel.name
      : session.modelName
    const operationName = session.relationName || `permit${session.modelName}`
    return `\
query ${operationName} {
  Some${modelName}Exists
}`
  }

  newPermissionTab = (
    permissionSession: PermissionSession,
    name: string,
    absolutePath: string,
    query: string,
  ) => {
    const newSession = Immutable({
      id: cuid(),
      selectedViewer: 'ADMIN',
      name,
      query,
      variables: '',
      result: '',
      operationName: undefined,
      hasChanged: true,
      hasQuery: false,
      permission: permissionSession,
      queryTypes: getQueryTypes(query),
      starred: false,
      absolutePath,
    })
    this.setState(state => {
      return {
        ...state,
        sessions: state.sessions.concat(newSession),
        selectedSessionIndex: state.sessions.length,
        changed: true,
      }
    })
  }

  handleNewPermissionTab = (permissionSession: PermissionSession) => {
    const query = this.getDefaultPermissionQuery(permissionSession)
    const newSession = Immutable({
      id: cuid(),
      selectedViewer: 'ADMIN',
      query,
      variables: '',
      result: '',
      operationName: undefined,
      hasQuery: false,
      permission: permissionSession,
      queryTypes: getQueryTypes(query),
      starred: false,
    })
    this.setState(state => {
      return {
        ...state,
        sessions: state.sessions.concat(newSession),
        selectedSessionIndex: state.sessions.length,
        changed: true,
      }
    })
  }

  setRef = (index: number, ref: any) => {
    this.graphiqlComponents[index] = ref
  }

  toggleSchemaReload = () => {
    this.setState(state => ({
      ...state,
      autoReloadSchema: !state.autoReloadSchema,
    }))
  }

  public newSession = (name?: string) => {
    let session = this.createSession()
    if (name) {
      session = Immutable.set(session, 'name', name)
    }
    this.setState(state => {
      return {
        ...state,
        sessions: state.sessions.concat(session),
        selectedSessionIndex: state.sessions.length,
        changed: true,
      }
    })
  }

  public closeTab = () => {
    const { sessions, selectedSessionIndex } = this.state
    if (sessions.length > 1) {
      this.handleCloseSession(sessions[selectedSessionIndex])
      return true
    }
    return false
  }

  public nextTab = () => {
    const { sessions, selectedSessionIndex } = this.state
    const numberOfSessions = sessions.length

    if (numberOfSessions > 1) {
      this.setState(state => {
        return {
          ...state,
          selectedSessionIndex:
            selectedSessionIndex < numberOfSessions - 1
              ? selectedSessionIndex + 1
              : 0,
        }
      })
    }
  }

  public prevTab = () => {
    const { sessions, selectedSessionIndex } = this.state
    const numberOfSessions = sessions.length

    if (numberOfSessions > 1) {
      this.setState(state => {
        return {
          ...state,
          selectedSessionIndex:
            selectedSessionIndex > 0
              ? selectedSessionIndex - 1
              : numberOfSessions - 1,
        }
      })
    }
  }

  public handleNewSession = (newIndexZero: boolean = false) => {
    let session = this.createSession()
    if (this.props.onboardingStep === 'STEP3_CREATE_MUTATION_TAB') {
      session = Immutable.set(session, 'query', onboardingEmptyMutation)
      setTimeout(() => {
        this.setCursor({
          line: 2,
          ch: 15,
        })
      }, 5)
      if (typeof this.props.nextStep === 'function') {
        this.props.nextStep()
      }
    }
    if (session.query === defaultQuery) {
      setTimeout(() => {
        this.setCursor({
          line: 1,
          ch: 0,
        })
      }, 5)
    }
    this.setState(state => {
      return {
        ...state,
        sessions: state.sessions.concat(session),
        selectedSessionIndex: newIndexZero ? 0 : state.sessions.length,
        changed: true,
      }
    })
  }
  public setValueInSession(
    sessionId: string,
    key: string,
    value: any,
    cb?: () => void,
  ) {
    this.setState(state => {
      // TODO optimize the lookup with a lookup table
      const i = state.sessions.findIndex(s => s.id === sessionId)
      return {
        ...state,
        sessions: Immutable.setIn(state.sessions, [i, key], value),
        changed: true,
      }
    })
    // hack to support older react versions
    setTimeout(() => {
      if (typeof cb === 'function') {
        cb()
      }
    }, 100)
  }

  private autofillMutation = () => {
    const sessionId = this.state.sessions[this.state.selectedSessionIndex].id
    if (this.props.onboardingStep === 'STEP3_ENTER_MUTATION1_VALUES') {
      this.setValueInSession(sessionId, 'query', onboardingFilledMutation1)
    } else if (this.props.onboardingStep === 'STEP3_ENTER_MUTATION2_VALUE') {
      this.setValueInSession(sessionId, 'query', onboardingFilledMutation2)
    }
    if (typeof this.props.nextStep === 'function') {
      this.props.nextStep()
    }
  }

  private toggleTheme = () => {
    this.setState(state => {
      const theme = state.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem('theme', theme)
      return { ...state, theme }
    })
  }

  private handleClickCodeGeneration = () => {
    this.setState({
      codeGenerationPopupOpen: true,
    } as State)
  }

  private handleCloseCodeGeneration = () => {
    this.setState({ codeGenerationPopupOpen: false } as State)
  }

  private handleUserSelection = user => {
    const systemApi = this.getSystemEndpoint()

    const query = `
      mutation {
        generateNodeToken(input: {
          rootToken: "${this.props.adminAuthToken}"
          serviceId: "${this.extractServiceId()}"
          nodeId: "${user.id}"
          modelName: "${this.state.userModelName}"
          clientMutationId: ""
        }) {
          clientMutationId
          token
        }
      }
    `

    fetch(systemApi, {
      method: 'post',
      body: JSON.stringify({ query }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.state.adminAuthToken}`,
      },
    })
      .then(res => res.json())
      .then(res => {
        const { token } = res.data.generateNodeToken

        if (token && this.state.selectUserSessionId) {
          const session = this.state.sessions[this.state.selectedSessionIndex]
          let newHeaders = session.headers
            ? session.headers.filter(h => h.name !== 'Authorization')
            : []
          newHeaders = newHeaders.concat({
            name: 'Authorization',
            value: `Bearer ${token}`,
          })
          this.setValueInSession(
            this.state.selectUserSessionId,
            'headers',
            newHeaders,
            () => {
              const concreteSession = this.state.sessions[
                this.state.selectedSessionIndex
              ]
              this.resetSubscription(concreteSession)
            },
          )
        }
      })
  }

  private resetSubscriptions() {
    this.state.sessions.forEach(session => this.resetSubscription(session))
  }

  private resetSubscription(session: Session) {
    if (this.observers[session.id]) {
      this.observers[session.id].complete()
      delete this.observers[session.id]
    }
    this.cancelSubscription(session)
    this.setWS(session)
  }

  private getUrlSession(sessions) {
    const prefix = '?query='
    if (location.search.includes(prefix)) {
      const uri = location.search.slice(prefix.length, location.search.length)
      const query = decodeURIComponent(uri)
      const equivalent = sessions.findIndex(
        session => session.query.trim() === query.trim(),
      )
      if (equivalent > -1) {
        this.initialIndex = equivalent
      } else {
        return this.createSessionFromQuery(query)
      }
    }

    return null
  }

  private handleCreateSession = (session: Session) => {
    const newSession = this.createSession(session)
    this.setState(state => {
      return {
        ...state,
        sessions: state.sessions.concat(newSession),
        selectedSessionIndex: state.sessions.length,
      }
    })
  }

  private handleItemStarToggled = (item: Session) => {
    this.setValueInHistory(item.id, 'starred', !item.starred)
  }

  private handleCloseSession = (session: Session) => {
    if (this.state.sessions.length === 1) {
      this.handleNewSession(true)
    }
    this.setState(state => {
      const i = state.sessions.findIndex(s => s.id === session.id)

      let nextSelectedSession = state.selectedSessionIndex
      if (nextSelectedSession > state.sessions.length - 2) {
        // if it's not the last session
        if (state.sessions.length > 1) {
          nextSelectedSession--
        }
      }
      return {
        ...state,
        sessions: [
          ...state.sessions.slice(0, i),
          ...state.sessions.slice(i + 1, state.sessions.length),
        ],
        selectedSessionIndex: nextSelectedSession,
        changed: true,
      }
    })

    this.storage.removeSession(session)
  }

  private handleOpenHistory = () => {
    this.setState({ historyOpen: true } as State)
  }

  private handleCloseHistory = () => {
    this.setState({ historyOpen: false } as State)
  }

  private handleSelectSession = (session: Session) => {
    this.setState(state => {
      const i = state.sessions.findIndex(s => s.id === session.id)

      if (
        this.props.onboardingStep === 'STEP3_SELECT_QUERY_TAB' &&
        i === 0 &&
        typeof this.props.nextStep === 'function'
      ) {
        this.props.nextStep()
      }
      return {
        ...state,
        selectedSessionIndex: i,
      }
    })
  }

  private initSessions = () => {
    if (
      ['STEP3_UNCOMMENT_DESCRIPTION', 'STEP3_OPEN_PLAYGROUND'].indexOf(
        this.props.onboardingStep || '',
      ) > -1
    ) {
      return this.initOnboardingSessions()
    }
    // defaulting to admin for deserialized sessions
    const sessions = this.storage.getSessions() // .map(session => Immutable.set(session, 'selectedViewer', 'ADMIN'))

    const urlSession = this.getUrlSession(sessions)

    if (urlSession) {
      if (sessions.length === 1 && sessions[0].query === defaultQuery) {
        return [urlSession]
      }
      return sessions.concat(urlSession)
    }

    if (sessions.length > 0) {
      if (sessions.length === 1 && sessions[0].query === defaultQuery) {
        setTimeout(() => {
          this.setCursor({
            line: 1,
            ch: 0,
          })
        }, 5)
      }
      return sessions
    }

    return [this.createSession()]
  }

  private initOnboardingSessions() {
    const session = this.createSession()

    return [
      {
        ...session,
        query: onboardingQuery1,
      },
    ]
  }

  private saveSessions = () => {
    this.state.sessions.forEach(session =>
      this.storage.saveSession(
        Immutable.set(session, 'subscriptionActive', false),
        false,
      ),
    )
  }

  private saveHistory = () => {
    this.storage.syncHistory(this.state.history)
  }

  private handleNewSessionWithoutNewIndexZero = () => {
    return this.handleNewSession(false)
  }

  private createSession = (session?: Session) => {
    let newSession
    const currentActiveSession =
      this.state && this.state.sessions[this.state.selectedSessionIndex]
    const headers = currentActiveSession ? currentActiveSession.headers : []
    if (session) {
      newSession = Immutable.set(session, 'id', cuid())
    } else {
      const query =
        this.storage.hasExecutedQuery() ||
        (this.state && this.state.sessions && this.state.sessions.length > 0)
          ? ''
          : defaultQuery

      newSession = Immutable({
        id: cuid(),
        selectedViewer: 'EVERYONE',
        query,
        variables: '',
        result: '',
        operationName: undefined,
        hasMutation: false,
        hasSubscription: false,
        hasQuery: false,
        queryTypes: getQueryTypes(query),
        starred: false,
        headers,
      })
    }

    this.storage.saveSession(newSession)
    return newSession
  }

  private createSessionFromQuery = (query: string) => {
    return Immutable({
      id: cuid(),
      selectedViewer: 'EVERYONE',
      query,
      variables: '',
      result: '',
      operationName: undefined,
      hasMutation: false,
      hasSubscription: false,
      hasQuery: false,
      queryTypes: getQueryTypes(query),
      starred: false,
    })
  }

  private handleChangeHeaders = (sessionId: string, headers: any[]) => {
    this.setValueInSession(sessionId, 'headers', headers)
  }

  private handleViewerChange = (sessionId: string, viewer: Viewer) => {
    const handleUser = () => {
      const session = this.state.sessions.find(sess => sess.id === sessionId)!
      if (viewer === 'USER') {
        // give the user some time to realize whats going on
        setTimeout(() => {
          this.setState({
            selectUserOpen: true,
            selectUserSessionId: sessionId,
          } as State)
        }, 300)
      }

      if (session) {
        this.resetSubscription(session)
      } else {
        throw new Error('session not found for viewer change')
      }
    }

    this.setValueInSession(sessionId, 'selectedViewer', viewer, () => {
      const session = this.state.sessions.find(sess => sess.id === sessionId)!
      let headers: any = session.headers
        ? session.headers.filter(h => h.name !== 'Authorization')
        : []
      if (viewer === 'ADMIN') {
        headers = headers.concat({
          name: 'Authorization',
          value: `Bearer ${this.props.adminAuthToken}`,
        })
      }
      if (viewer === 'ADMIN' || viewer === 'EVERYONE') {
        this.setValueInSession(sessionId, 'headers', headers, () => {
          handleUser()
        })
      } else {
        handleUser()
      }
    })
  }

  private handleCloseSelectUser = () => {
    this.setState({
      selectUserOpen: false,
    } as State)
  }

  private handleVariableChange = (sessionId: string, variables: string) => {
    this.setValueInSession(sessionId, 'variables', variables)
  }

  private handleOperationNameChange = (
    sessionId: string,
    operationName: string,
  ) => {
    this.setValueInSession(sessionId, 'operationName', operationName)
  }

  private setValueInHistory(sessionId: string, key: string, value: any) {
    this.setState(state => {
      // TODO optimize the lookup with a lookup table
      const i = state.history.findIndex(s => s.id === sessionId)
      return {
        ...state,
        history: Immutable.setIn(state.history, [i, key], value),
      }
    })
  }

  private isGraphcoolUrl(endpoint) {
    return endpoint.includes('api.graph.cool')
  }

  private getSimpleEndpoint() {
    if (this.props.isEndpoint) {
      return location.pathname
    }
    return this.props.endpoint
  }

  private getSystemEndpoint() {
    return `${this.httpApiPrefix}/system`
  }

  get httpApiPrefix() {
    return this.props.endpoint.match(/(https?:\/\/.*?)\/?/)![1]
  }

  get wsApiPrefix() {
    const { endpoint } = this.props
    const isDev = endpoint.indexOf('dev.graph.cool') > -1

    // tslint:disable-next-line
    if (isDev) {
      return 'wss://dev.subscriptions.graph.cool/v1'
    } else if (endpoint.includes('graph.cool')) {
      return 'wss://subscriptions.graph.cool/v1'
    }

    return null
  }

  private getWSEndpoint() {
    if (this.props.subscriptionsEndpoint) {
      return this.props.subscriptionsEndpoint
    }
    if (this.wsApiPrefix) {
      const projectId =
        this.props.projectId ||
        (this.props.endpoint.includes('graph.cool') &&
          this.props.endpoint.split('/').slice(-1)[0])
      return `${this.wsApiPrefix}/${projectId}`
    } else {
      return null
    }
  }

  private addToHistory(session: Session) {
    const id = cuid()
    const historySession = Immutable.merge(session, {
      id,
      date: new Date(),
    })
    this.setState(state => {
      return {
        ...state,
        history: [historySession].concat(state.history),
      }
    })
    this.storage.addToHistory(historySession)
  }

  private historyIncludes(session: Session) {
    const duplicate = this.state.history.find(
      item =>
        session.query === item.query &&
        session.variables === item.variables &&
        session.operationName === item.operationName &&
        session.selectedViewer === item.selectedViewer,
    )
    return Boolean(duplicate)
  }

  private cancelSubscription = (session: Session) => {
    this.setValueInSession(session.id, 'subscriptionActive', false)
    if (session.subscriptionId) {
      if (this.wsConnections[session.id]) {
        this.wsConnections[session.id].unsubscribe(session.subscriptionId)
      }
      this.setValueInSession(session.id, 'subscriptionId', null)
    }
  }

  private permissionFetcher = (session: Session, graphQLParams) => {
    const { query } = graphQLParams

    if (!query.includes('IntrospectionQuery')) {
      if (!this.historyIncludes(session)) {
        setImmediate(() => {
          this.addToHistory(session)
        })
      }
    }

    const endpoint = this.getPermissionEndpoint()

    const headers: any = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.props.adminAuthToken}`,
    }

    return fetch(endpoint, {
      method: 'post',
      headers,
      body: JSON.stringify(graphQLParams),
    }).then(response => {
      this.storage.executedQuery()
      return response.json()
    })
  }

  private fetcher = (session: Session, graphQLParams, requestHeaders?: any) => {
    const { query, operationName } = graphQLParams

    if (!query.includes('IntrospectionQuery')) {
      if (
        [
          'STEP3_RUN_QUERY1',
          'STEP3_RUN_MUTATION1',
          'STEP3_RUN_MUTATION2',
          'STEP3_RUN_QUERY2',
        ].indexOf(this.props.onboardingStep || '') > -1 &&
        typeof this.props.nextStep === 'function'
      ) {
        if (this.props.onboardingStep === 'STEP3_RUN_QUERY2') {
          setTimeout(() => {
            // typescript wants to be happy...
            if (typeof this.props.nextStep === 'function') {
              this.props.nextStep()
            }
          }, 2000)
        } else {
          this.props.nextStep()
        }
      }

      if (!this.historyIncludes(session)) {
        setImmediate(() => {
          this.addToHistory(session)
        })
      }

      if (isQuerySubscription(query, operationName)) {
        /* tslint:disable-next-line */
        return Observable.create(observer => {
          this.observers[session.id] = observer
          if (!session.subscriptionActive) {
            this.setValueInSession(session.id, 'subscriptionActive', true)
          }

          const wsConnection = this.wsConnections[session.id]

          const id = wsConnection.subscribe(graphQLParams, (err, res) => {
            const data: any = { data: res, isSubscription: true }
            if (err) {
              data.error = err
            }
            observer.next(data)
          })

          this.setValueInSession(session.id, 'subscriptionId', id)
          return () => {
            this.cancelSubscription(session)
          }
        })
      }
    }

    const endpoint = this.getSimpleEndpoint()

    let headers: any = {
      'Content-Type': 'application/json',
    }

    if (session.headers) {
      session.headers.forEach(header => {
        headers[header.name] = header.value
      })
    }

    if (requestHeaders) {
      headers = { ...headers, ...requestHeaders }
    }

    return fetch(endpoint, {
      // tslint:disable-line
      method: 'post',
      headers,
      credentials: 'include',
      body: JSON.stringify(graphQLParams),
    }).then(response => {
      if (typeof this.props.onSuccess === 'function') {
        this.props.onSuccess(graphQLParams, response)
      }
      if (this.props.isEndpoint) {
        history.pushState(
          {},
          'Graphcool Playground',
          `?query=${encodeURIComponent(query)}`,
        )
      }
      this.storage.executedQuery()
      return response.json()
    })
  }

  private isSharingAuthorization = (): boolean => {
    const {
      sessions,
      shareHttpHeaders,
      shareAllTabs,
      selectedSessionIndex,
    } = this.state

    // if we're not sharing *any* headers, then just return false
    if (!shareHttpHeaders) {
      return false
    }

    let sharableSessions: Session[]

    if (!shareAllTabs) {
      const currentSession: Session = sessions[selectedSessionIndex]
      sharableSessions = [currentSession]
    } else {
      // all sessions
      sharableSessions = sessions
    }

    return isSharingAuthorization(sharableSessions)
  }

  private toggleUseVim = () => {
    this.setState(
      state => ({ ...state, useVim: !state.useVim }),
      () => {
        localStorage.setItem('useVim', String(this.state.useVim))
      },
    )
  }

  private toggleShareAllTabs = () => {
    this.setState(state => ({ ...state, shareAllTabs: !state.shareAllTabs }))
  }

  private toggleShareHTTPHeaders = () => {
    this.setState(state => ({
      ...state,
      shareHttpHeaders: !state.shareHttpHeaders,
    }))
  }

  private toggleShareHistory = () => {
    this.setState(state => ({ ...state, shareHistory: !state.shareHistory }))
  }

  private share = () => {
    this.saveSessions()
    this.saveHistory()
    this.storage.saveProject()
    let sharingProject: any = this.storage.project

    if (!this.state.shareHttpHeaders) {
      sharingProject = {
        ...sharingProject,
        sessions: mapValues(sharingProject.sessions, (session: Session) => {
          session.headers = []
          return session
        }),
      }
    }

    if (!this.state.shareAllTabs) {
      const currentSession: Session = this.state.sessions[
        this.state.selectedSessionIndex
      ]
      sharingProject = {
        ...sharingProject,
        sessions: {
          [currentSession.id]: currentSession,
        },
      }
    }

    if (!this.state.shareHistory) {
      sharingProject = {
        ...sharingProject,
        history: [],
      }
    }

    this.props.share(sharingProject)
    this.setState({ changed: false })
  }
}

export default connect<any, any, Props>(state => state.graphiqlDocs, {
  setStacks,
})(Playground)

function isSharingAuthorization(sharableSessions: Session[]): boolean {
  // If user's gonna share an Authorization header,
  // let's warn her

  // Check all sessions
  for (const session of sharableSessions) {
    // Check every header of each session
    for (const header of session.headers || []) {
      // If there's a Authorization header present,
      // set the flag to `true` and stop the loop
      if (header.name.toLowerCase() === 'authorization') {
        // break
        return true
      }
    }
  }

  return false
}

const PlaygroundWrapper = styled.div`
  display: flex;
  flex-direction: column;

  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  margin-right: -1px !important;

  line-height: 1.5;
  font-family: 'Open Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  letter-spacing: 0.53px;
  color: rgba(0, 0, 0, 0.8);

  a:active,
  a:focus,
  button:focus,
  input:focus {
    outline: none;
  }
`

const GraphiqlsContainer = styled.div`
  height: calc(100vh - 57px);
  position: relative;
  overflow: hidden;
`

const GraphiqlWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`
