import * as React from 'react'
import * as ReactDOM from 'react-dom'
import MiddlewareApp from './components/MiddlewareApp'
import './styles/graphiql_dark.css'
import './styles/graphiql_light.css'
import './index.css'

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
        configString={JSON.stringify(config, null, 2)}
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
          default: 'http://localhost:4000',
        },
      },
    },
    database: {
      schemaPath: 'src/generated/prisma.graphql',
      extensions: {
        prisma: 'database/prisma.yml',
        'prepare-binding': {
          output: 'src/generated/prisma.ts',
          generator: 'prisma-ts',
        },
        endpoints: {
          dev: {
            url: 'https://eu1.prisma.sh/lol/hall/dev',
            headers: {
              Authorization:
                'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InNlcnZpY2UiOiJoYWxsQGRldiIsInJvbGVzIjpbImFkbWluIl19LCJpYXQiOjE1MjE4MjIwNDQsImV4cCI6MTUyMjQyNjg0NH0.rxU4v6GeBOZxzSRP9-AeJbrmkcZBNKjecH7d43OEUqc',
            },
          },
        },
      },
    },
  },
}
