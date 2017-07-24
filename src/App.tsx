import * as React from 'react'
import { Provider } from 'react-redux'
import createStore from './createStore'
import Playground from './Playground'
import ThemeProvider from './theme/ThemeProvider'

const store = createStore()

const testProjectId = 'asdf'
const regex = /.*?graph\.cool\/simple\/.{1,2}\/(.{1,25})/

function getParameterByName(name) {
  const url = window.location.href
  name = name.replace(/[\[\]]/g, '\\$&')
  const regexa = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)')
  const results = regexa.exec(url)
  if (!results) {
    return null
  }
  if (!results[2]) {
    return ''
  }
  return decodeURIComponent(results[2].replace(/\+/g, ' '))
}

export interface State {
  stepIndex: number
  theme: string
}

class App extends React.Component<{}, State> {
  constructor() {
    super()

    this.state = {
      stepIndex: 0,
      theme: 'black',
    }
  }

  handleChangeTheme = theme => {
    this.setState({ theme })
  }

  render() {
    const endpoint = getParameterByName('endpoint')
    let projectId: any = testProjectId
    if (regex.test(location.href)) {
      const result = regex.exec(location.href)
      if (result) {
        projectId = result[1]
      }
    }

    const isDev = location.href.indexOf('dev.graph.cool') > -1
    const isLocalhost = location.href.indexOf('localhost') > -1

    let subscriptionUrl
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

    /* tslint:disable */
    // httpApiPrefix={production ? 'https://api.graph.cool' : 'http://localhost:60000'}

    return (
      <Provider store={store}>
        <ThemeProvider theme={this.state.theme}>
          <Playground
            endpoint={endpoint || 'https://graphql-europe.org/graphql'}
            wsApiPrefix={subscriptionUrl}
            adminAuthToken=""
            httpApiPrefix="https://api.graph.cool"
          />
        </ThemeProvider>
      </Provider>
    )
  }
}

export default App
