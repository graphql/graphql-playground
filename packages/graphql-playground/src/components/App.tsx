import * as React from 'react'
import { Provider } from 'react-redux'
import createStore from '../createStore'
import Playground from './Playground'
import ThemeProvider from './Theme/ThemeProvider'

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
  endpointUrl?: string
  subscriptionPrefix?: string
  subscriptionEndpoint?: string
}

export interface State {
  endpointUrl?: string
  subscriptionPrefix?: string
  subscriptionEndpoint?: string
}

class App extends React.Component<{}, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      endpointUrl: props.endpointUrl,
      subscriptionPrefix: props.subscriptionPrefix,
      subscriptionEndpoint: props.subscriptionEndpoint,
    }
  }

  render() {
    let { endpointUrl, subscriptionPrefix, subscriptionEndpoint } = this.state
    // If no  endpointUrl passed tries to get one from url
    if (!endpointUrl) {
      endpointUrl = getParameterByName('endpoint')
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
        <ThemeProvider theme="light">
          <Playground
            endpoint={endpointUrl}
            subscriptionsEndpoint={subscriptionEndpoint}
            wsApiPrefix={subscriptionPrefix}
            httpApiPrefix="https://api.graph.cool"
          />
        </ThemeProvider>
      </Provider>
    )
  }
}

export default App
