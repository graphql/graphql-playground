const express = require('express')
const bodyParser = require('body-parser')
const expressPlayground = require('graphql-playground-middleware-express').default

const defaults = { port: 8080, endpoint: 'http://localhost:3000/graphql' }
const port = +process.env.PORT || defaults.port
const endpoint = process.env.ENDPOINT || defaults.endpoint

const app = express()

app.get('/', expressPlayground({ endpoint }))

app.listen(port, function(error) {
  if (error) console.error(error)
  console.log(
    `GraphQL Endpoint set to ${endpoint} ${
      endpoint === defaults.endpoint ? '(Default)' : ''
    }`,
    `\n\nServing the GraphQL Playground on http://localhost:${port}/playground ${
      port === defaults.port ? '(Default)' : ''
    }`
  )
})
