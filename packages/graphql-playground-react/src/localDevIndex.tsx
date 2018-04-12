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
        {...options}
        config={config}
        configString={configString}
      />,
      element,
    )
  },
}

const configString = `projects:
app:
  schemaPath: "src/schema.graphql"
  extensions:
    endpoints:
      default: "http://localhost:4000"
database:
  schemaPath: "src/generated/prisma.graphql"
  extensions:
    prisma: database/prisma.yml`

const config = {
  projects: {
    prisma: {
      schemaPath: 'src/generated/prisma.graphql',
      includes: ['database/seed.graphql'],
      extensions: {
        prisma: 'database/prisma.yml',
        'prepare-binding': {
          output: 'src/generated/prisma.ts',
          generator: 'prisma-ts',
        },
        endpoints: {
          dev: {
            url: 'https://eu1.prisma.sh/lol/asdf/dev',
            headers: {
              Authorization:
                'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InNlcnZpY2UiOiJhc2RmQGRldiIsInJvbGVzIjpbImFkbWluIl19LCJpYXQiOjE1MjM1MTg3NTYsImV4cCI6MTUyNDEyMzU1Nn0.fzKhXa1JpN9M1UGTbS6p2KMUWDrKLxYD3i3a9eVfOQQ',
            },
          },
        },
      },
    },
    app: {
      schemaPath: 'src/schema.graphql',
      includes: ['queries/{booking,queries}.graphql'],
      extensions: {
        endpoints: {
          default: 'http://localhost:4000',
        },
      },
    },
  },
}
