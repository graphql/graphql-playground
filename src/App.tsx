import * as React from 'react'
import Playground from './Playground'

// const testProjectId = 'ciyfxizss09b00119ucqaphyu'
// const testProjectId = 'ciwnb78gb14v40101ut70haxc'
// const testProjectId = 'ciwm5q6r20lcv0101al2192er'
// const testProjectId = 'cirs1ufsg02b101619ru0bx4r'
// const testProjectId = 'cixvxz4yv00an0154bgcerdug'
const testProjectId = 'ciz6u07s109vlfc645kv4put6'
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
    // const adminAuthToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0ODU3ODQ4MjMsImNsaWVudElkIjoiY2lscGV2ZnUxMDAwYjBwbDh3bWRtejVkZCJ9.pxTD8zLOM63lJyWQ4TWrm8OCS74JkgmPgCg6zdCmxVI'
    // const adminAuthToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0ODY4OTg1ODUsImNsaWVudElkIjoiY2l4dnh4bXI1MDA3NTAxNTRrMTU1NXV0eCJ9.zWohEinj0y7jTx7zMxn5LGnX2ghxiHlkGBfR7uRYWuQ'
    const adminAuthToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0ODY4OTkzNzMsImNsaWVudElkIjoiY2lscGV2ZnUxMDAwYjBwbDh3bWRtejVkZCJ9.di3RFd4Gowsc2haw7Dlv6k9RceENs5NyrZ4ui_hEO9s'


    return (
      <Playground
        projectId={projectId}
        adminAuthToken={adminAuthToken}
        isEndpoint={process.env.NODE_ENV.includes('production')}
        httpApiPrefix='http://localhost:60000'
        wsApiPrefix='ws://localhost:8085'
      />
    )
  }
}

export default App
