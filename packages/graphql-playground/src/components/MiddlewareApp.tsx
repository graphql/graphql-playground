import * as React from 'react'
import { Provider } from 'react-redux'
import createStore from '../createStore'
import Playground from './Playground'

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
}

export interface State {
  endpoint: string
  subscriptionPrefix?: string
  subscriptionEndpoint: string
  shareUrl?: string
  platformToken?: string
}

class MiddlewareApp extends React.Component<{}, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      endpoint:
        props.endpoint || getParameterByName('endpoint') || location.href,
      platformToken: localStorage.getItem('platform-token') || undefined,
      subscriptionEndpoint:
        props.subscriptionEndpoint ||
        getParameterByName('subscriptionEndpoint') ||
        getSubscriptionsUrl(location.href),
    }
  }

  componentWillMount() {
    const platformToken = getParameterByName('platform-token')
    if (platformToken && platformToken.length > 0) {
      localStorage.setItem('platform-token', platformToken)
      window.location.replace(window.location.origin + window.location.pathname)
    }
  }

  render() {
    return (
      <Provider store={store}>
        <Playground
          endpoint={this.state.endpoint}
          subscriptionsEndpoint={this.state.subscriptionEndpoint}
          share={this.share}
          shareUrl={this.state.shareUrl}
          onChangeEndpoint={this.handleChangeEndpoint}
          onChangeSubscriptionsEndpoint={this.handleChangeSubscriptionsEndpoint}
          adminAuthToken={this.state.platformToken}
        />
      </Provider>
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
          endpoint: this.state.endpoint,
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

  private handleChangeEndpoint = endpoint => {
    this.setState({ endpoint })
  }

  private handleChangeSubscriptionsEndpoint = subscriptionEndpoint => {
    this.setState({ subscriptionEndpoint })
  }
}

export default MiddlewareApp

function getSubscriptionsUrl(href) {
  if (href.includes('graph.cool')) {
    const projectId = href.split('/').slice(-1)[0]
    return `wss://subscriptions.graph.cool/v1/${projectId}`
  }
  if (href.includes('localhost') && href.includes('/simple/')) {
    // it's a graphcool local endpoint
    const projectId = href.split('/').slice(-1)[0]
    return `ws://${location.host}/subscriptions/v1/${projectId}`
  }
  return href
}
