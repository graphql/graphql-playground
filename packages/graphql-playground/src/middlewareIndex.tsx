import * as React from 'react'
import * as ReactDOM from 'react-dom'
import MiddlewareApp from './components/MiddlewareApp'
import './styles/graphiql_dark.css'
import './styles/graphiql_light.css'
import './index.css'
import 'graphcool-styles/dist/styles.css'

if (process.env.NODE_ENV !== 'production') {
  /* tslint:disable-next-line */
  // const { whyDidYouUpdate } = require('why-did-you-update')
  // whyDidYouUpdate(React)
}

/* tslint:disable-next-line */
;(window as any)['GraphQLPlayground'] = {
  init(element: HTMLElement, options) {
    ReactDOM.render(
      <MiddlewareApp
        // configString={exampleYmlConfig}
        // folderName={folderName}
        setTitle={true}
        showNewWorkspace={false}
        env={env}
        {...options}
      />,
      element,
    )
  },
}

// const exampleJsonConfig = `\
// {
//   "schemaPath": "schema.graphql",
//   "extensions": {
//     "endpoints": {
//       "prod": {
//         "url": "https://airbnb.now.sh",
//         "subscription": "wss://airbnb.now.sh"
//       },
//       "local": {
//         "url": "http://localhost:4000",
//         "subscription": "ws://localhost:4000"
//       }
//     }
//   }
// }`

// const folderName = `airbnb`

// const exampleYmlConfig = `\
// schemaPath: schema.graphql
// projects:
//   privateCluster:
//     extensions:
//       endpoints:
//         default:
//           url: 'https://tim.graph.cool/system'
//   gateway:
//     extensions:
//       endpoints:
//         default:
//           url: 'https://airbnb.now.sh'
//           subscription: 'wss://airbnb.now.sh'
//         dev:
//           url: 'http://localhost:4000'
//           subscription: 'ws://localhost:4000'
//   database:
//     extensions:
//       endpoints:
//         dev:
//           url: 'https://api.graph.cool/simple/v1/\${env:SERVICE_ID}'
// `

// const exampleYmlConfig = `\
// schemaPath: schema.graphql
// extensions:
//   endpoints:
//     default:
//       url: 'https://airbnb.now.sh'
//       subscription: 'wss://airbnb.now.sh'
//     local:
//       url: 'http://localhost:4000'
//       subscription: 'ws://localhost:4000'
// `

const env = {
  SERVICE_ID: 'asdf',
}
