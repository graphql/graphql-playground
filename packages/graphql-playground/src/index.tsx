import * as React from 'react'
import * as ReactDOM from 'react-dom'
import App from './components/App'
import './styles/graphiql_dark.css'
import './styles/graphiql_light.css'
import './index.css'
import 'graphcool-styles/dist/styles.css'
;(window as any).GraphQLPlayground = {
  init(element: HTMLElement, options) {
    ReactDOM.render(<App {...options} />, element)
  },
}
