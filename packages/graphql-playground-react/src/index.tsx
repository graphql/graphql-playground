import * as React from 'react'
import * as ReactDOM from 'react-dom'
import Root from './components/Root'
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
    ReactDOM.render(<Root {...options} />, element)
  },
}
