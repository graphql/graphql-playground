import * as React from 'react'
import Playground from './Playground'

// const testProjectId = 'ciyfxizss09b00119ucqaphyu'
// const testProjectId = 'ciwnb78gb14v40101ut70haxc'
const testProjectId = 'ciwm5q6r20lcv0101al2192er'
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
    /* tslint:disable */
    const adminAuthToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0ODU3ODQ4MjMsImNsaWVudElkIjoiY2lscGV2ZnUxMDAwYjBwbDh3bWRtejVkZCJ9.pxTD8zLOM63lJyWQ4TWrm8OCS74JkgmPgCg6zdCmxVI'


    return (
      <Playground
        projectId={projectId}
        adminAuthToken={adminAuthToken}
        isEndpoint={process.env.NODE_ENV.includes('production')}
        httpApiPrefix='https://dev.api.graph.cool'
      />
    )
  }
}

export default App
