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
    graphcool: {
      extensions: {
        endpoints: {
          asdf: 'https://api.graph.cool/simple/v1/asdf',
          docs: 'https://api.graph.cool/simple/v1/graphcool-docs',
        },
      },
    },
    'tim01/test-service': {
      extensions: {
        endpoints: {
          dev3: {
            url: 'https://tim01_lol.prisma.sh/test-service/dev3',
            headers: {
              Authorization: `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1MjE3MzE3NDQsIm5iZiI6MTUyMTY0NTM0NH0.rulM7fCHkCZHmYKTHgMrwroKcOlkuWnjV8aQHBNpcKs`,
            },
          },
        },
      },
    },
  },
}
