import * as React from 'react'
import * as ReactDOM from 'react-dom'
import MiddlewareApp from './components/MiddlewareApp'
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
      <MiddlewareApp setTitle={true} showNewWorkspace={false} {...options} />,
      element,
    )
  },
}
