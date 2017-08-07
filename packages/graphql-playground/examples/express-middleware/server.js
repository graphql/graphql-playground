const express = require('express');
const graphqlHTTP = require('express-graphql');
const { express: playgroundMiddleware } = require('graphql-playground/middleware');
const schema = require('./schema');

const app = express();
const PORT = 3001;

app.use('/graphql', graphqlHTTP(() => ({ schema })));
app.use('/playground', playgroundMiddleware({ endpointUrl: '/graphql' }));

app.listen(PORT, function() {
  const port = this.address().port;

  console.log(`Started on http://localhost:${port}/`);
});
