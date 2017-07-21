import * as React from 'react'
import Playground from './Playground'
import ThemeProvider from './theme/ThemeProvider'

const testProjectId = 'asdf'
const regex = /.*?graph\.cool\/simple\/.{1,2}\/(.{1,25})/

interface State {
  stepIndex: number
  theme: string
}

class App extends React.Component<{}, State> {
  constructor() {
    super()

    this.state = {
      stepIndex: 0,
      theme: 'light',
    }
  }

  handleChangeTheme = theme => {
    this.setState({ theme })
  }

  render() {
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
      <ThemeProvider theme={this.state.theme}>
        <Playground
          endpoint="http://localhost:9002/graphql"
          wsApiPrefix={subscriptionUrl}
          adminAuthToken=""
          httpApiPrefix="https://api.graph.cool"
        />
      </ThemeProvider>
    )
  }
}

export default App
