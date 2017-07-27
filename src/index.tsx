import * as React from 'react'
import * as ReactDOM from 'react-dom'
import App from './App'
import '../graphiql_dark.css'
import '../graphiql_light.css'
import './index.css'
import '../base.css'
import 'graphcool-styles/dist/styles.css'
;(window as any).GraphQLPlayground = {
  init(element: HTMLElement, options) {
    ReactDOM.render(<App {...options} />, element)
  },
}
