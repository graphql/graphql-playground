import * as React from 'react'
import Playground from './Playground'

// const testProjectId = 'ciyfxizss09b00119ucqaphyu'
// const testProjectId = 'ciwnb78gb14v40101ut70haxc'
// const testProjectId = 'ciwm5q6r20lcv0101al2192er'
// const testProjectId = 'cirs1ufsg02b101619ru0bx4r'
// const testProjectId = 'cj1wabwr309m3013545yiket0'
const testProjectId = 'asdf'
// const testProjectId = 'cirs1ufsg02b101619ru0bx5r'
const regex = /.*?graph\.cool\/simple\/.{1,2}\/(.{1,25})/

interface State {
  stepIndex: number
}

class App extends React.Component<null, State> {
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
    // const adminAuthToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0ODU3ODQ4MjMsImNsaWVudElkIjoiY2lscGV2ZnUxMDAwYjBwbDh3bWRtejVkZCJ9.pxTD8zLOM63lJyWQ4TWrm8OCS74JkgmPgCg6zdCmxVI'
    // const adminAuthToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0ODY4OTg1ODUsImNsaWVudElkIjoiY2l4dnh4bXI1MDA3NTAxNTRrMTU1NXV0eCJ9.zWohEinj0y7jTx7zMxn5LGnX2ghxiHlkGBfR7uRYWuQ'
    // const adminAuthToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0ODY4OTkzNzMsImNsaWVudElkIjoiY2lscGV2ZnUxMDAwYjBwbDh3bWRtejVkZCJ9.di3RFd4Gowsc2haw7Dlv6k9RceENs5NyrZ4ui_hEO9s'
    // const adminAuthToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0ODU1MTEyNDUsImNsaWVudElkIjoiY2lscGV2ZnUxMDAwYjBwbDh3bWRtejVkZCIsInByb2plY3RJZCI6ImNpcnMxdWZzZzAyYjEwMTYxOXJ1MGJ4NXIiLCJwZXJtYW5lbnRBdXRoVG9rZW5JZCI6ImNpeWZuMWgxZTA1cWMwMTE5NTY5Y2Z2cTUifQ.XSQo8l58zB2koBcB0M-LiDqSjg0-P8tJANcTxOa6RUA'

    // httpApiPrefix={production ? 'https://api.graph.cool' : 'http://localhost:60000'}
    // const production = process.env.NODE_ENV.includes('production')

    /*adminAuthToken={adminAuthToken}*/
    //isEndpoint={production}
    global['nextStep'] = this.handleNextStep
    const step = steps[this.state.stepIndex]

    console.log('Step', step)
    return (
      <Playground
        projectId={projectId}
        wsApiPrefix={subscriptionUrl}
        adminAuthToken='eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0ODU1MTEyNDUsImNsaWVudElkIjoiY2lscGV2ZnUxMDAwYjBwbDh3bWRtejVkZCIsInByb2plY3RJZCI6ImNpcnMxdWZzZzAyYjEwMTYxOXJ1MGJ4NXIiLCJwZXJtYW5lbnRBdXRoVG9rZW5JZCI6ImNpeWZuMWgxZTA1cWMwMTE5NTY5Y2Z2cTUifQ.XSQo8l58zB2koBcB0M-LiDqSjg0-P8tJANcTxOa6RUA'
        httpApiPrefix='https://api.graph.cool'
      />
    )
  }

  private handleNextStep = () => {
    this.setState(state => {
      return {
        stepIndex: state.stepIndex + 1,
      }
    })
  }
}
// nextStep={this.handleNextStep}
// tether={Tether}
// onboardingStep={step}

const steps = [
  // 'STEP3_OPEN_PLAYGROUND',
  'STEP3_UNCOMMENT_DESCRIPTION',
  'STEP3_RUN_QUERY1',
  'STEP3_CREATE_MUTATION_TAB',
  'STEP3_ENTER_MUTATION1_VALUES',
  'STEP3_RUN_MUTATION1',
  'STEP3_ENTER_MUTATION2_VALUE',
  'STEP3_RUN_MUTATION2',
  'STEP3_SELECT_QUERY_TAB',
  'STEP3_RUN_QUERY2',
  'STEP3_OPEN_FINAL_POPUP',
]

// httpApiPrefix='http://localhost:60000'
// wsApiPrefix='ws://localhost:8085/v1'

// interface TetherProps {
//   children?: any
//   steps?: any[]
// }
//
// function Tether({children}: TetherProps) {
//   return (
//     <div className='tether-wrapper'>
//       <style jsx={true}>{`
//         .tether-wrapper {
//           @p: .relative;
//         }
//         .tether {
//           z-index: 999;
//           border-radius: 2px;
//           background: rgba(255,255,255,0.5);
//           pointer-events: none;
//           position: absolute;
//           padding: 16px;
//           width: 150px;
//           top: 10px;
//         }
//       `}</style>
//       {children}
//       <div className="tether">
//         Whoohooo This is a Tether
//       </div>
//     </div>
//   )
// }

export default App
