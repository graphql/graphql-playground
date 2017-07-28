import * as React from 'react'
import { Provider } from 'react-redux'
import createStore from './createStore'
import Playground from './Playground'
import ThemeProvider from './theme/ThemeProvider'

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
  subscriptionUrl?: string
}

export interface State {
  endpointUrl?: string
  subscriptionUrl?: string
}

class App extends React.Component<{}, State> {
  constructor(props) {
    super(props)

    this.state = {
      endpointUrl: props.endpointUrl,
      subscriptionUrl: props.subscriptionUrl,
    }
  }

  render() {
    let { endpointUrl, subscriptionUrl } = this.state
    // If no  endpointUrl passed tries to get one from url
    if (!endpointUrl) {
      endpointUrl = getParameterByName('endpoint')
    }
    if (!subscriptionUrl) {
      const isDev = location.href.indexOf('dev.graph.cool') > -1
      const isLocalhost = location.href.indexOf('localhost') > -1

      // tslint:disable-next-line
      if (isLocalhost) {
        subscriptionUrl = 'ws://localhost:8085/v1'
      } else if (isDev) {
        subscriptionUrl = 'wss://dev.subscriptions.graph.cool/v1'
      } else {
        subscriptionUrl = 'wss://subscriptions.graph.cool/v1'
      }

      // TODO remove before publishing app
      subscriptionUrl = 'wss://subscriptions.graph.cool/v1'
    }

    return (
      <Provider store={store}>
        <ThemeProvider theme="light">
          <Playground
            endpoint={endpointUrl}
            wsApiPrefix={subscriptionUrl}
            httpApiPrefix="https://api.graph.cool"
          />
        </ThemeProvider>
      </Provider>
    )
  }
}

export default App
