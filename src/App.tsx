import * as React from 'react'
import Playground from './Playground'

const testProjectId = 'ciyfxizss09b00119ucqaphyu'
// const testProjectId = 'cirs1ufsg02b101619ru0bx4r'
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
    /* tslint:disable-line */

    return (
      <Playground
        projectId={projectId}
        authToken='eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0ODU2ODgwMTUsImNsaWVudElkIjoiY2lscGV2ZnUxMDAwYjBwbDh3bWRtejVkZCIsInByb2plY3RJZCI6ImNpeWZ4aXpzczA5YjAwMTE5dWNxYXBoeXUiLCJwZXJtYW5lbnRBdXRoVG9rZW5JZCI6ImNpeWlrYTlmaTB4bjgwMTIwaWhnYXljdDcifQ.gJS4z1DKjIzYcB3ZHwrVPwthp6rBexiXOJGaptkGhIA'
        isEndpoint={process.env.NODE_ENV.includes('production')}
      />
    )
  }
}

export default App
