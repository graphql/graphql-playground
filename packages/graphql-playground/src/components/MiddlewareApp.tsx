import * as React from 'react'
import { Provider } from 'react-redux'
import createStore from '../createStore'
import Playground from './Playground'
import { Helmet } from 'react-helmet'

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
  subscriptionEndpoint?: string
  setTitle?: boolean
}

export interface State {
  endpoint: string
  subscriptionPrefix?: string
  subscriptionEndpoint?: string
  shareUrl?: string
  platformToken?: string
}

class MiddlewareApp extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    const endpoint =
      props.endpoint || getParameterByName('endpoint') || location.href

    this.state = {
      endpoint,
      platformToken: localStorage.getItem('platform-token') || undefined,
      subscriptionEndpoint:
        props.subscriptionEndpoint ||
        getParameterByName('subscriptionEndpoint') ||
        '',
    }
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

    return (
      <div>
        {title}
        <Provider store={store}>
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
          />
        </Provider>
      </div>
    )
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

export default MiddlewareApp
