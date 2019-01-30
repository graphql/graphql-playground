import * as React from 'react'
import Playground, { Playground as IPlayground } from './Playground'
import { Helmet } from 'react-helmet'
import { GraphQLConfig } from '../graphqlConfig'
import * as yaml from 'js-yaml'
import ProjectsSideNav from './ProjectsSideNav'
import {
  styled,
  ThemeProvider,
  theme as styledTheme,
  keyframes,
} from '../styled'
import {
  darkColours,
  lightColours,
  darkEditorColours,
  lightEditorColours,
  EditorColours,
} from '../styled/theme'
// import OldThemeProvider from './Theme/ThemeProvider'
import { getActiveEndpoints } from './util'
import { ISettings } from '../types'
import { connect } from 'react-redux'
import { getTheme, getSettings } from '../state/workspace/reducers'
import { Session, Tab } from '../state/sessions/reducers'
import { ApolloLink } from 'apollo-link'
import { injectTabs } from '../state/workspace/actions'
import { buildSchema, buildClientSchema, GraphQLSchema } from 'graphql'

function getParameterByName(name: string, uri?: string): string | null {
  const url = uri || window.location.href
  name = name.replace(/[\[\]]/g, '\\$&')
  const regexa = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)')
  const results = regexa.exec(url)
  if (!results || !results[2]) {
    return null
  }
  return decodeURIComponent(results[2].replace(/\+/g, ' '))
}

export interface PlaygroundWrapperProps {
  endpoint?: string
  endpointUrl?: string
  subscriptionEndpoint?: string
  setTitle?: boolean
  settings?: ISettings
  shareEnabled?: string
  fixedEndpoint?: string
  folderName?: string
  configString?: string
  showNewWorkspace?: boolean
  isElectron?: boolean
  canSaveConfig?: boolean
  onSaveConfig?: (configString: string) => void
  onNewWorkspace?: () => void
  getRef?: (ref: any) => void
  platformToken?: string
  env?: any
  config?: GraphQLConfig
  configPath?: string
  injectedState?: any
  createApolloLink?: (
    session: Session,
    subscriptionEndpoint?: string,
  ) => ApolloLink
  tabs?: Tab[]
  schema?: { __schema: any } // introspection result
  codeTheme?: EditorColours
  workspaceName?: string
  headers?: any
}

export interface ReduxProps {
  theme: string
  injectTabs: (tabs: Tab[]) => void
}

export interface State {
  endpoint: string
  subscriptionPrefix?: string
  subscriptionEndpoint?: string
  shareUrl?: string
  platformToken?: string
  configIsYaml?: boolean
  configString?: string
  activeProjectName?: string
  activeEnv?: string
  headers?: any
  schema?: GraphQLSchema
}

class PlaygroundWrapper extends React.Component<
  PlaygroundWrapperProps & ReduxProps,
  State
> {
  playground: IPlayground
  constructor(props: PlaygroundWrapperProps & ReduxProps) {
    super(props)
    ;(global as any).m = this

    this.state = this.mapPropsToState(props)
    this.removeLoader()
  }

  mapPropsToState(props: PlaygroundWrapperProps): State {
    const configIsYaml = props.configString
      ? this.isConfigYaml(props.configString)
      : false

    const { activeEnv, projectName } = this.getInitialActiveEnv(props.config)

    let endpoint =
      props.endpoint ||
      props.endpointUrl ||
      getParameterByName('endpoint') ||
      location.href

    const result = this.extractEndpointAndHeaders(endpoint)
    endpoint = result.endpoint
    let headers = result.headers

    let subscriptionEndpoint: any =
      props.subscriptionEndpoint || getParameterByName('subscriptionEndpoint')

    if (props.configString && props.config && activeEnv) {
      const endpoints = getActiveEndpoints(props.config, activeEnv, projectName)
      endpoint = endpoints.endpoint
      subscriptionEndpoint = endpoints.subscriptionEndpoint
      headers = endpoints.headers
    }

    subscriptionEndpoint =
      this.normalizeSubscriptionUrl(endpoint, subscriptionEndpoint) || undefined

    return {
      endpoint: this.absolutizeUrl(endpoint),
      platformToken:
        props.platformToken ||
        localStorage.getItem('platform-token') ||
        undefined,
      subscriptionEndpoint,
      configIsYaml,
      configString: props.configString,
      activeEnv,
      activeProjectName: projectName,
      headers,
    }
  }

  extractEndpointAndHeaders(endpoint) {
    const splitted = endpoint.split('?')
    if (splitted.length === 1) {
      return { endpoint }
    }
    try {
      const headers = getParameterByName('headers', endpoint)
      if (headers) {
        return { headers: JSON.parse(headers), endpoint: splitted[0] }
      }
    } catch (e) {
      //
    }
    return { endpoint: splitted[0] }
  }

  removeLoader() {
    const loadingWrapper = document.getElementById('loading-wrapper')
    if (loadingWrapper) {
      loadingWrapper.remove()
    }
  }

  normalizeSubscriptionUrl(endpoint, subscriptionEndpoint) {
    if (subscriptionEndpoint) {
      if (subscriptionEndpoint.startsWith('/')) {
        const secure =
          endpoint.includes('https') || location.href.includes('https')
            ? 's'
            : ''
        return `ws${secure}://${location.host}${subscriptionEndpoint}`
      } else {
        return subscriptionEndpoint.replace(/^http/, 'ws')
      }
    }

    return this.getGraphcoolSubscriptionEndpoint(endpoint).replace(
      /^http/,
      'ws',
    )
  }

  getGraphcoolSubscriptionEndpoint(endpoint) {
    if (endpoint.includes('api.graph.cool')) {
      return `wss://subscriptions.graph.cool/v1/${
        endpoint.split('/').slice(-1)[0]
      }`
    }

    return endpoint.replace(/^http/, 'ws')
  }

  componentWillReceiveProps(nextProps: PlaygroundWrapperProps & ReduxProps) {
    // Reactive props (props that cause a state change upon being changed)
    if (
      nextProps.endpoint !== this.props.endpoint ||
      nextProps.endpointUrl !== this.props.endpointUrl ||
      nextProps.subscriptionEndpoint !== this.props.subscriptionEndpoint ||
      nextProps.configString !== this.props.configString ||
      nextProps.platformToken !== this.props.platformToken ||
      nextProps.config !== this.props.config
    ) {
      this.setState(this.mapPropsToState(nextProps))
      this.setInitialWorkspace(nextProps)
    }
  }

  getInitialActiveEnv(
    config?: GraphQLConfig,
  ): { projectName?: string; activeEnv?: string } {
    if (config) {
      if (config.extensions && config.extensions.endpoints) {
        return {
          activeEnv: Object.keys(config.extensions.endpoints)[0],
        }
      }
      if (config.projects) {
        const projectName = Object.keys(config.projects)[0]
        const project = config.projects[projectName]
        if (project.extensions && project.extensions.endpoints) {
          return {
            activeEnv: Object.keys(project.extensions.endpoints)[0],
            projectName,
          }
        }
      }
    }

    return {}
  }

  isConfigYaml(configString: string) {
    try {
      yaml.safeLoad(configString)
      return true
    } catch (e) {
      //
    }
    return false
  }

  absolutizeUrl(url) {
    if (url.startsWith('/')) {
      return location.origin + url
    }

    return url
  }

  componentWillMount() {
    const platformToken = getParameterByName('platform-token')
    if (platformToken && platformToken.length > 0) {
      localStorage.setItem('platform-token', platformToken)
      window.location.replace(window.location.origin + window.location.pathname)
    }
  }

  componentDidMount() {
    if (this.state.subscriptionEndpoint === '') {
      this.updateSubscriptionsUrl()
    }
    setTimeout(() => {
      this.removePlaygroundInClass()
    }, 5000)
    this.setInitialWorkspace()
    if (this.props.tabs) {
      this.props.injectTabs(this.props.tabs)
    } else {
      const query = getParameterByName('query')
      if (query) {
        const endpoint = getParameterByName('endpoint') || this.state.endpoint
        this.props.injectTabs([{ query, endpoint }])
      } else {
        const tabsString = getParameterByName('tabs')
        if (tabsString) {
          try {
            const tabs = JSON.parse(tabsString)
            this.props.injectTabs(tabs)
          } catch (e) {
            //
          }
        }
      }
    }

    if (this.props.schema) {
      // in this case it's sdl
      if (typeof this.props.schema === 'string') {
        this.setState({ schema: buildSchema(this.props.schema) })
        // if it's an object, it must be an introspection query
      } else {
        this.setState({ schema: buildClientSchema(this.props.schema) })
      }
    }
  }

  setInitialWorkspace(props = this.props) {
    if (props.config) {
      const activeEnv = this.getInitialActiveEnv(props.config)
      const endpoints = getActiveEndpoints(
        props.config,
        activeEnv.activeEnv!,
        activeEnv.projectName,
      )
      const endpoint = endpoints.endpoint
      const subscriptionEndpoint =
        endpoints.subscriptionEndpoint ||
        this.normalizeSubscriptionUrl(endpoint, endpoints.subscriptionEndpoint)
      const headers = endpoints.headers
      this.setState({
        endpoint,
        subscriptionEndpoint,
        headers,
        activeEnv: activeEnv.activeEnv,
        activeProjectName: activeEnv.projectName,
      })
    }
  }

  removePlaygroundInClass() {
    const root = document.getElementById('root')
    if (root) {
      root.classList.remove('playgroundIn')
    }
  }

  render() {
    const title = this.props.setTitle ? (
      <Helmet>
        <title>{this.getTitle()}</title>
      </Helmet>
    ) : null

    const defaultHeaders = this.props.headers || {}
    const stateHeaders = this.state.headers || {}
    const combinedHeaders = { ...defaultHeaders, ...stateHeaders }

    const { theme } = this.props
    return (
      <div>
        {title}
        <ThemeProvider
          theme={{
            ...styledTheme,
            mode: theme,
            colours: theme === 'dark' ? darkColours : lightColours,
            editorColours: {
              ...(theme === 'dark' ? darkEditorColours : lightEditorColours),
              ...this.props.codeTheme,
            },
            settings: this.props.settings,
          }}
        >
          <App>
            {this.props.config &&
              this.state.activeEnv && (
                <ProjectsSideNav
                  config={this.props.config}
                  folderName={this.props.folderName || 'GraphQL App'}
                  theme={theme}
                  activeEnv={this.state.activeEnv}
                  onSelectEnv={this.handleSelectEnv}
                  onNewWorkspace={this.props.onNewWorkspace}
                  showNewWorkspace={Boolean(this.props.showNewWorkspace)}
                  isElectron={Boolean(this.props.isElectron)}
                  activeProjectName={this.state.activeProjectName}
                  configPath={this.props.configPath}
                />
              )}
            <Playground
              endpoint={this.state.endpoint}
              shareEnabled={this.props.shareEnabled}
              subscriptionEndpoint={this.state.subscriptionEndpoint}
              shareUrl={this.state.shareUrl}
              onChangeEndpoint={this.handleChangeEndpoint}
              onChangeSubscriptionsEndpoint={
                this.handleChangeSubscriptionsEndpoint
              }
              adminAuthToken={this.state.platformToken}
              getRef={this.getPlaygroundRef}
              config={this.props.config!}
              configString={this.state.configString!}
              configIsYaml={this.state.configIsYaml!}
              canSaveConfig={Boolean(this.props.canSaveConfig)}
              onChangeConfig={this.handleChangeConfig}
              onSaveConfig={this.handleSaveConfig}
              onUpdateSessionCount={this.handleUpdateSessionCount}
              fixedEndpoints={Boolean(this.state.configString)}
              fixedEndpoint={this.props.fixedEndpoint}
              headers={combinedHeaders}
              configPath={this.props.configPath}
              workspaceName={
                this.props.workspaceName || this.state.activeProjectName
              }
              createApolloLink={this.props.createApolloLink}
              schema={this.state.schema}
            />
          </App>
        </ThemeProvider>
      </div>
    )
  }

  handleUpdateSessionCount = () => {
    this.forceUpdate()
  }

  getPlaygroundRef = ref => {
    this.playground = ref
    if (typeof this.props.getRef === 'function') {
      this.props.getRef(ref)
    }
  }

  handleChangeConfig = (configString: string) => {
    this.setState({ configString })
  }

  handleSaveConfig = () => {
    /* tslint:disable-next-line */
    if (typeof this.props.onSaveConfig === 'function') {
      /* tslint:disable-next-line */
      this.props.onSaveConfig(this.state.configString!)
    }
  }

  handleSelectEnv = (env: string, projectName?: string) => {
    const { endpoint, subscriptionEndpoint, headers } = getActiveEndpoints(
      this.props.config!,
      env,
      projectName,
    )!
    this.setState({
      activeEnv: env,
      endpoint,
      headers,
      subscriptionEndpoint: this.normalizeSubscriptionUrl(
        endpoint,
        subscriptionEndpoint,
      ),
      activeProjectName: projectName,
    })
  }

  private handleChangeEndpoint = endpoint => {
    this.setState({ endpoint })
  }

  private handleChangeSubscriptionsEndpoint = subscriptionEndpoint => {
    this.setState({ subscriptionEndpoint })
  }

  private getTitle() {
    if (
      this.state.platformToken ||
      this.state.endpoint.includes('api.graph.cool')
    ) {
      const projectId = this.getProjectId(this.state.endpoint)
      const cluster = this.state.endpoint.includes('api.graph.cool')
        ? 'shared'
        : 'local'
      return `${cluster}/${projectId} - Playground`
    }

    return `Playground - ${this.state.endpoint}`
  }

  private async updateSubscriptionsUrl() {
    const candidates = this.getSubscriptionsUrlCandidated(this.state.endpoint)
    const validCandidate = await find(candidates, candidate =>
      this.wsEndpointValid(candidate),
    )
    if (validCandidate) {
      this.setState({ subscriptionEndpoint: validCandidate })
    }
  }

  private getSubscriptionsUrlCandidated(endpoint): string[] {
    const candidates: string[] = []
    candidates.push(endpoint.replace('https', 'wss').replace('http', 'ws'))
    if (endpoint.includes('graph.cool')) {
      candidates.push(
        `wss://subscriptions.graph.cool/v1/${this.getProjectId(endpoint)}`,
      )
    }
    if (endpoint.includes('/simple/v1/')) {
      // it's a graphcool local endpoint
      const host = endpoint.match(/https?:\/\/(.*?)\//)
      candidates.push(
        `ws://${host![1]}/subscriptions/v1/${this.getProjectId(endpoint)}`,
      )
    }
    return candidates
  }

  private wsEndpointValid(url): Promise<boolean> {
    return new Promise(resolve => {
      const socket = new WebSocket(url, 'graphql-ws')
      socket.addEventListener('open', event => {
        socket.send(JSON.stringify({ type: 'connection_init' }))
      })
      socket.addEventListener('message', event => {
        const data = JSON.parse(event.data)
        if (data.type === 'connection_ack') {
          resolve(true)
        }
      })
      socket.addEventListener('error', event => {
        resolve(false)
      })
      setTimeout(() => {
        resolve(false)
      }, 1000)
    })
  }

  private getProjectId(endpoint) {
    return endpoint.split('/').slice(-1)[0]
  }
}

const mapStateToProps = (state, ownProps) => {
  const theme = ownProps.theme || getTheme(state, ownProps.settings)
  const settings = getSettings(state)
  return { theme, settings }
}

export default connect(
  mapStateToProps,
  { injectTabs },
)(PlaygroundWrapper)

async function find(
  iterable: any[],
  predicate: (item?: any, index?: number) => Promise<boolean>,
): Promise<any | null> {
  for (let i = 0; i < iterable.length; i++) {
    const element = iterable[i]
    const result = await predicate(element, i)
    if (result) {
      return element
    }
  }
  return null
}

const appearIn = keyframes`
  from { 
    opacity: 0;
    transform: translateY(10px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
`

const App = styled.div`
  display: flex;
  width: 100%;
  opacity: 0;
  transform: translateY(10px);
  animation: ${appearIn} 0.5s ease-out forwards 0.2s;
`
