import * as React from 'react'
import Playground from './Playground'

const testProjectId = 'asdf'
const regex = /.*?graph\.cool\/simple\/.{1,2}\/(.{1,25})/

interface State {
  stepIndex: number
}

class App extends React.Component<{}, State> {
  constructor() {
    super()

    this.state = {
      stepIndex: 0,
    }
  }
  render() {

    let projectId: any = testProjectId
    if (regex.test(location.href)) {
      const result = regex.exec(location.href)
      if (result) {
        projectId = result[1]
      }
    }

    let isDev = location.href.indexOf('dev.graph.cool') > -1
    let isLocalhost = location.href.indexOf('localhost') > -1

    let subscriptionUrl
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
      <Playground
        projectId={projectId}
        wsApiPrefix={subscriptionUrl}
        adminAuthToken=''
        httpApiPrefix='https://api.graph.cool'
      />
    )
  }
}

export default App
