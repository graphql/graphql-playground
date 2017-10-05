import * as React from 'react'
import { Provider } from 'react-redux'
import createStore from '../createStore'
import Playground from './Playground'

const store = createStore()

function getParameterByName(name: string): string {
  const url = window.location.href
  name = name.replace(/[\[\]]/g, '\\$&')
  const regexa = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)')
  const results = regexa.exec(url)
  if (!results || !results[2]) {
    return ''
  }
  return decodeURIComponent(results[2].replace(/\+/g, ' '))
}

export interface Props {
  endpoint?: string
  subscriptionPrefix?: string
  subscriptionEndpoint?: string
}

export interface State {
  endpoint: string
  subscriptionPrefix?: string
  subscriptionEndpoint: string
  shareUrl?: string
}

class MiddlewareApp extends React.Component<{}, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      endpoint:
        localStorage.getItem('last-endpoint') ||
        props.endpoint ||
        location.href,
      subscriptionPrefix: props.subscriptionPrefix,
      subscriptionEndpoint:
        localStorage.getItem('last-subscriptions-endpoint') ||
        props.subscriptionEndpoint ||
        getSubscriptionsUrl(location.href),
    }
  }

  render() {
    let { endpoint, subscriptionPrefix, subscriptionEndpoint } = this.state
    // If no  endpoint passed tries to get one from url
    if (!endpoint) {
      endpoint = getParameterByName('endpoint')
    }
    if (!subscriptionEndpoint) {
      subscriptionEndpoint = getParameterByName('subscription')
    }
    if (!subscriptionPrefix) {
      const isDev = location.href.indexOf('dev.graph.cool') > -1
      const isLocalhost = location.href.indexOf('localhost') > -1

      // tslint:disable-next-line
      if (isLocalhost) {
        subscriptionPrefix = 'ws://localhost:8085/v1'
      } else if (isDev) {
        subscriptionPrefix = 'wss://dev.subscriptions.graph.cool/v1'
      } else {
        subscriptionPrefix = 'wss://subscriptions.graph.cool/v1'
      }

      // TODO remove before publishing app
      subscriptionPrefix = 'wss://subscriptions.graph.cool/v1'
    }

    return (
      <Provider store={store}>
        <Playground
          endpoint={this.state.endpoint}
          subscriptionsEndpoint={this.state.subscriptionEndpoint}
          wsApiPrefix={subscriptionPrefix}
          httpApiPrefix="https://api.graph.cool"
          share={this.share}
          shareUrl={this.state.shareUrl}
          onChangeEndpoint={this.handleChangeEndpoint}
          onChangeSubscriptionsEndpoint={this.handleChangeSubscriptionsEndpoint}
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
    localStorage.setItem('last-endpoint', endpoint)
  }

  private handleChangeSubscriptionsEndpoint = subscriptionEndpoint => {
    this.setState({ subscriptionEndpoint })
    localStorage.setItem('last-subscriptions-endpoint', subscriptionEndpoint)
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
