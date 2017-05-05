import * as React from 'react'
import Playground from './Playground'

// const testProjectId = 'ciyfxizss09b00119ucqaphyu'
// const testProjectId = 'ciwnb78gb14v40101ut70haxc'
// const testProjectId = 'ciwm5q6r20lcv0101al2192er'
// const testProjectId = 'cirs1ufsg02b101619ru0bx4r'
const testProjectId = 'cj1wabwr309m3013545yiket0'
// const testProjectId = 'cirs1ufsg02b101619ru0bx5r'
const regex = /.*?graph\.cool\/simple\/.{1,2}\/(.{1,25})/

class App extends React.Component<null, null> {
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
    // const adminAuthToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0ODU3ODQ4MjMsImNsaWVudElkIjoiY2lscGV2ZnUxMDAwYjBwbDh3bWRtejVkZCJ9.pxTD8zLOM63lJyWQ4TWrm8OCS74JkgmPgCg6zdCmxVI'
    // const adminAuthToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0ODY4OTg1ODUsImNsaWVudElkIjoiY2l4dnh4bXI1MDA3NTAxNTRrMTU1NXV0eCJ9.zWohEinj0y7jTx7zMxn5LGnX2ghxiHlkGBfR7uRYWuQ'
    // const adminAuthToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0ODY4OTkzNzMsImNsaWVudElkIjoiY2lscGV2ZnUxMDAwYjBwbDh3bWRtejVkZCJ9.di3RFd4Gowsc2haw7Dlv6k9RceENs5NyrZ4ui_hEO9s'
    // const adminAuthToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0ODU1MTEyNDUsImNsaWVudElkIjoiY2lscGV2ZnUxMDAwYjBwbDh3bWRtejVkZCIsInByb2plY3RJZCI6ImNpcnMxdWZzZzAyYjEwMTYxOXJ1MGJ4NXIiLCJwZXJtYW5lbnRBdXRoVG9rZW5JZCI6ImNpeWZuMWgxZTA1cWMwMTE5NTY5Y2Z2cTUifQ.XSQo8l58zB2koBcB0M-LiDqSjg0-P8tJANcTxOa6RUA'

    // httpApiPrefix={production ? 'https://api.graph.cool' : 'http://localhost:60000'}
    // const production = process.env.NODE_ENV.includes('production')

    /*adminAuthToken={adminAuthToken}*/
    //isEndpoint={production}
    return (
      <Playground
        projectId={projectId}
        wsApiPrefix={subscriptionUrl}
        adminAuthToken='eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0OTMxMzA3MzgsImNsaWVudElkIjoiY2lscGV2ZnUxMDAwYjBwbDh3bWRtejVkZCIsInByb2plY3RJZCI6ImNqMXdhYndyMzA5bTMwMTM1NDV5aWtldDAiLCJwZXJtYW5lbnRBdXRoVG9rZW5JZCI6ImNqMXhuaG5iMTB4c2IwMTQydTM3MmlpNHQifQ.78ht-PXYhq_S4J65YEIY47hN1HiVo9Xodi56_smdmB4'
        httpApiPrefix='https://dev.api.graph.cool'
      />
    )
  }
}
// httpApiPrefix='http://localhost:60000'
// wsApiPrefix='ws://localhost:8085/v1'

export default App
