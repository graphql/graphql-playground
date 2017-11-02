import React from 'react'
import ReactDOM from 'react-dom'
import Playground from 'graphql-playground'
import 'graphql-playground/playground.css'
import './index.css'

ReactDOM.render(<Playground endpoint="https://api.graph.cool/simple/v1/swapi" />, document.body)
