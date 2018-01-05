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
        setTitle={true}
        showNewWorkspace={false}
        config={config}
        {...options}
      />,
      element,
    )
  },
}

const config = {
  projects: {
    app: {
      schemaPath: 'src/schema.graphql',
      extensions: {
        endpoints: {
          default: 'http://localhost:5000',
        },
      },
    },
    database: {
      schemaPath: 'src/generated/database.graphql',
      extensions: {
        graphcool: 'graphcool.yml',
        endpoints: {
          dev: {
            url: 'http://localhost:60000/nilan/dev',
            headers: {
              Authorization:
                'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InNlcnZpY2UiOiJuaWxhbkBkZXYiLCJyb2xlcyI6WyJhZG1pbiJdfSwiaWF0IjoxNTE1MTQ1NzI1LCJleHAiOjE1MTU3NTA1MjV9.PP3HPmxqDTS3AM_7J4IjBvWAqhbK9m3Awe4padHLxRs',
            },
          },
        },
      },
    },
  },
}
