import * as React from 'react'
import { Provider } from 'react-redux'
import createStore from '../createStore'
import Playground, { Playground as IPlayground } from './Playground'
import { Helmet } from 'react-helmet'
import * as fetch from 'isomorphic-fetch'
import { GraphQLConfig } from '../graphqlConfig'
import * as yaml from 'js-yaml'
import ProjectsSideNav from './ProjectsSideNav'
import { styled, ThemeProvider, theme as styledTheme } from '../styled'
import OldThemeProvider from './Theme/ThemeProvider'
import { getActiveEndpoints } from './util'
import { ISettings } from '../types'
import PlaygroundStorage from './PlaygroundStorage'
import { mapKeys } from 'lodash'

const store = createStore()

function getParameterByName(name: string): string | null {
  const url = window.location.href
  name = name.replace(/[\[\]]/g, '\\$&')
  const regexa = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)')
  const results = regexa.exec(url)
  if (!results || !results[2]) {
    return null
  }
  return decodeURIComponent(results[2].replace(/\+/g, ' '))
}

export interface Props {
  endpoint?: string
  endpointUrl?: string
  subscriptionEndpoint?: string
  setTitle?: boolean
  settings?: ISettings
  folderName?: string
  configString?: string
  showNewWorkspace?: boolean
  isElectron?: boolean
  canSaveConfig?: boolean
  onSaveConfig?: (configString: string) => void
  onNewWorkspace?: () => void
  getRef?: (ref: any) => void
  platformToken?: string
  session?: any
  env?: any
  config?: GraphQLConfig
  configPath?: string
}

export interface State {
  endpoint: string
  subscriptionPrefix?: string
  subscriptionEndpoint?: string
  shareUrl?: string
  platformToken?: string
  settingsString: string
  settings: ISettings
  configIsYaml?: boolean
  configString?: string
  activeProjectName?: string
  activeEnv?: string
  headers?: any
}

const defaultSettings = `{
  "general.betaUpdates": false,
  "editor.theme": "dark",
  "editor.reuseHeaders": true,
  "tracing.hideTracingResponse": true
}`

export default class MiddlewareApp extends React.Component<Props, State> {
  playground: IPlayground
  constructor(props: Props) {
    super(props)
    ;(global as any).m = this

    let settingsString = localStorage.getItem('settings') || defaultSettings
    settingsString = this.migrateSettingsString(settingsString)

    const configIsYaml = props.configString
      ? this.isConfigYaml(props.configString)
      : false

    const { activeEnv, projectName } = this.getInitialActiveEnv(props.config)

    let headers
    let endpoint =
      props.endpoint ||
      props.endpointUrl ||
      getParameterByName('endpoint') ||
      location.href

    let subscriptionEndpoint: string | undefined | null =
      props.subscriptionEndpoint || getParameterByName('subscriptionEndpoint')

    if (props.configString && props.config && activeEnv) {
      const endpoints = getActiveEndpoints(props.config, activeEnv, projectName)
      endpoint = endpoints.endpoint
      subscriptionEndpoint = endpoints.subscriptionEndpoint
      headers = endpoints.headers
    } else {
      subscriptionEndpoint = this.getGraphcoolSubscriptionEndpoint(endpoint)
    }

    this.state = {
      endpoint: this.absolutizeUrl(endpoint),
      platformToken:
        props.platformToken ||
        localStorage.getItem('platform-token') ||
        undefined,
      subscriptionEndpoint: subscriptionEndpoint
        ? this.normalizeSubscriptionUrl(endpoint, subscriptionEndpoint)
        : '',
      settingsString,
      settings: this.getSettings(settingsString),
      configIsYaml,
      configString: props.configString,
      activeEnv,
      activeProjectName: projectName,
      headers,
    }
  }

  getGraphcoolSubscriptionEndpoint(endpoint) {
    if (endpoint.includes('api.graph.cool')) {
      return `wss://subscriptions.graph.cool/v1/${
        endpoint.split('/').slice(-1)[0]
      }`
    }

    return endpoint
  }

  migrateSettingsString(settingsString: string): string {
    const defaultSettingsObject = JSON.parse(defaultSettings)
    const replacementMap = {
      theme: 'editor.theme',
      reuseHeaders: 'editor.reuseHeaders',
    }

    try {
      const currentSettings = JSON.parse(settingsString)
      const settings = {
        ...defaultSettingsObject,
        ...mapKeys(currentSettings, (value, key) => replacementMap[key] || key),
      }
      return JSON.stringify(settings, null, 2)
    } catch (e) {
      //
    }

    return settingsString
  }

  componentWillReceiveProps(nextProps: Props) {
    if (
      nextProps.configString !== this.props.configString &&
      nextProps.configString
    ) {
      const configIsYaml = this.isConfigYaml(nextProps.configString)
      this.setState({ configIsYaml })
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

  normalizeSubscriptionUrl(endpoint, subscriptionEndpoint) {
    if (subscriptionEndpoint.startsWith('/')) {
      const secure =
        endpoint.includes('https') || location.href.includes('https') ? 's' : ''
      return `ws${secure}://${location.host}${subscriptionEndpoint}`
    }

    return subscriptionEndpoint
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
  }

  render() {
    const title = this.props.setTitle ? (
      <Helmet>
        <title>{this.getTitle()}</title>
      </Helmet>
    ) : null
    const theme = this.state.settings['editor.theme']

    return (
      <div>
        {title}
        <Provider store={store}>
          <ThemeProvider theme={{ ...styledTheme, mode: theme }}>
            <OldThemeProvider theme={theme}>
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
                      onEditConfig={this.handleStartEditConfig}
                      getSessionCount={this.getSessionCount}
                      activeProjectName={this.state.activeProjectName}
                    />
                  )}
                <Playground
                  endpoint={this.state.endpoint}
                  subscriptionsEndpoint={this.state.subscriptionEndpoint}
                  share={this.share}
                  shareUrl={this.state.shareUrl}
                  onChangeEndpoint={this.handleChangeEndpoint}
                  onChangeSubscriptionsEndpoint={
                    this.handleChangeSubscriptionsEndpoint
                  }
                  adminAuthToken={this.state.platformToken}
                  settings={this.normalizeSettings(this.state.settings)}
                  settingsString={this.state.settingsString}
                  onSaveSettings={this.handleSaveSettings}
                  onChangeSettings={this.handleChangeSettings}
                  getRef={this.getPlaygroundRef}
                  config={this.props.config!}
                  configString={this.state.configString!}
                  configIsYaml={this.state.configIsYaml!}
                  canSaveConfig={Boolean(this.props.canSaveConfig)}
                  onChangeConfig={this.handleChangeConfig}
                  onSaveConfig={this.handleSaveConfig}
                  onUpdateSessionCount={this.handleUpdateSessionCount}
                  fixedEndpoints={Boolean(this.state.configString)}
                  session={this.props.session}
                  headers={this.state.headers}
                  configPath={this.props.configPath}
                />
              </App>
            </OldThemeProvider>
          </ThemeProvider>
        </Provider>
      </div>
    )
  }

  handleUpdateSessionCount = () => {
    this.forceUpdate()
  }

  getSessionCount = (endpoint: string): number => {
    if (this.state.endpoint === endpoint && this.playground) {
      return this.playground.state.sessions.length
    }

    return PlaygroundStorage.getSessionCount(endpoint)
  }

  getPlaygroundRef = ref => {
    this.playground = ref
    if (typeof this.props.getRef === 'function') {
      this.props.getRef(ref)
    }
  }

  handleStartEditConfig = () => {
    this.playground.openConfigTab()
  }

  handleChangeConfig = (configString: string) => {
    this.setState({ configString })
  }

  handleSaveConfig = () => {
    /* tslint:disable-next-line */
    console.log('handleSaveConfig called')
    if (typeof this.props.onSaveConfig === 'function') {
      /* tslint:disable-next-line */
      console.log('calling this.props.onSaveConfig', this.state.configString)
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
      subscriptionEndpoint,
      activeProjectName: projectName,
    })
  }

  private getSettings(settingsString = this.state.settingsString): ISettings {
    try {
      const settings = JSON.parse(settingsString)
      return this.normalizeSettings(settings)
    } catch (e) {
      // ignore
    }

    return JSON.parse(defaultSettings)
  }

  private normalizeSettings(settings: ISettings) {
    const theme = settings['editor.theme']
    if (theme !== 'dark' && theme !== 'light') {
      settings['editor.theme'] = 'dark'
    }

    return settings
  }

  private handleChangeSettings = (settingsString: string) => {
    this.setState({ settingsString })
  }

  private handleSaveSettings = () => {
    try {
      const settings = JSON.parse(this.state.settingsString)
      this.setState({ settings })
      localStorage.setItem('settings', this.state.settingsString)
    } catch (e) {
      /* tslint:disable-next-line */
      console.error(e)
    }
  }

  private share = (session: any) => {
    fetch('https://api.graph.cool/simple/v1/cj81hi46q03c30196uxaswrz2', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
        mutation ($session: String! $endpoint: String!) {
          addSession(session: $session endpoint: $endpoint) {
            id
          }
        }
      `,
        variables: {
          session: JSON.stringify(session),
          endpoint: this.normalizeEndpoint(this.state.endpoint),
        },
      }),
    })
      .then(res => res.json())
      .then(res => {
        const shareUrl = `https://graphqlbin.com/${res.data.addSession.id}`
        // const shareUrl = `${location.origin}/${res.data.addSession.id}`
        this.setState({ shareUrl })
      })
  }

  private normalizeEndpoint(endpoint) {
    if (!endpoint.match(/https?:\/\/(.*?)\//)) {
      return location.origin + endpoint
    } else {
      return endpoint
    }
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
      const socket = new WebSocket(
        'wss://subscriptions.graph.cool/v1/cirs1ufsg02b101619ru0bx5r',
        'graphql-ws',
      )
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

const App = styled.div`
  display: flex;
  width: 100%;
`
