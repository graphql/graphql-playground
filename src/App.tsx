import * as React from 'react'
import Playground from './Playground'


const testProjectId = 'ciwf2nhji00ky01711z4twwvp'
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

    return (
      <Playground
        projectId={projectId}
        isEndpoint={true}
        useOriginAsUrl={true}
        authToken='eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0ODUzNDk3NzgsImNsaWVudElkIjoiY2lscGV2ZnUxMDAwYjBwbDh3bWRtejVkZCJ9.Tu6Qzrnho8xIJ8BKUYlMAXwRTFN2WXZc__LnFIv0B6U'
      />
    )
  }
}

export default App
