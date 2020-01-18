import * as React from 'react'
import * as ReactDOM from 'react-dom'
import MiddlewareApp from './components/MiddlewareApp'
import './index.css'
// import { Tab } from './state/sessions/reducers'
import { LinkCreatorProps } from './state/sessions/fetchingSagas'
import { ApolloLink } from 'apollo-link'
import { HttpLink } from 'apollo-link-http'
// import { exampleSchema } from './fixtures/exampleSchema'

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
        // config={config}
        // configString={configString}
        // codeTheme={lightEditorColours}
        // tabs={tabs}
        createApolloLink={customLinkCreator}
        // schema={exampleSchema}
      />,
      element,
    )
  },
}

// const configString = `projects:
// app:
//   schemaPath: "src/schema.graphql"
//   extensions:
//     endpoints:
//       default: "http://localhost:4000"
// database:
//   schemaPath: "src/generated/prisma.graphql"
//   extensions:
//     prisma: database/prisma.yml`

// const config = {
//   projects: {
//     prisma: {
//       schemaPath: 'src/generated/prisma.graphql',
//       includes: ['database/seed.graphql'],
//       extensions: {
//         prisma: 'database/prisma.yml',
//         'prepare-binding': {
//           output: 'src/generated/prisma.ts',
//           generator: 'prisma-ts',
//         },
//         endpoints: {
//           dev2: {
//             url: 'https://eu1.prisma.sh/public-asdf/session65/dev',
//             // headers: {
//             //   Authorization:
//             //     'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InNlcnZpY2UiOiJhc2RmQGRldiIsInJvbGVzIjpbImFkbWluIl19LCJpYXQiOjE1MjM1MTg3NTYsImV4cCI6MTUyNDEyMzU1Nn0.fzKhXa1JpN9M1UGTbS6p2KMUWDrKLxYD3i3a9eVfOQQ',
//             // },
//           },
//         },
//       },
//     },
//     app: {
//       schemaPath: 'src/schema.graphql',
//       includes: ['queries/{booking,queries}.graphql'],
//       extensions: {
//         endpoints: {
//           default: 'http://localhost:4000',
//         },
//       },
//     },
//   },
// }

// const tabs: Tab[] = [
//   {
//     query: '{ users { id } }',
//     endpoint: 'https://eu1.prisma.sh/public-asdf/session65/dev',
//     responses: ['{}'],
//   },
//   {
//     query: '{ users { id } }',
//     endpoint: 'https://eu1.prisma.sh/public-asdf/session65/dev',
//   },
// ]

const customLinkCreator = (
  session: LinkCreatorProps,
  wsEndpoint?: string,
): { link: ApolloLink } => {
  const { headers, credentials } = session

  const link = new HttpLink({
    uri: session.endpoint,
    fetch,
    headers,
    credentials,
  })

  return { link }
}

// const lightEditorColours = {
//   property: '#328c8c',
//   comment: 'rgba(0, 0, 0, 0.3)',
//   punctuation: 'rgba(23,42,58,.8)',
//   keyword: '#366b6b',
//   def: 'rgb(56, 189, 193)',
//   qualifier: '#1c92a9',
//   attribute: '#b56531',
//   number: '#1f6ed6;',
//   string: '#d64292',
//   builtin: '#d47509',
//   string2: '#0b7fc7',
//   variable: 'rgb(236, 95, 103)',
//   meta: '#b33086',
//   atom: 'rgb(245, 160, 0)',
//   ws: 'rgba(23, 42, 58, 0.8)',
//   selection: '#d1e9fd',
//   cursorColor: 'rgba(0, 0, 0, 0.4)',

//   editorBackground: '#f6f7f7',
//   resultBackground: '#eeeff0',
//   leftDrawerBackground: '#e9eaea',
//   rightDrawerBackground: '#e5e7e7',
// }
