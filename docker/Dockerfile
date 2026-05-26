FROM node:alpine

RUN mkdir /app
COPY server/index.js /app
COPY server/package.json /app

WORKDIR /app
RUN yarn

ENV GRAPHQLPLAYGROUND_PORT 8080
ENV GRAPHQLPLAYGROUND_HOST "http://localhost:3000/graphql"
ENV GRAPHQLPLAYGROUND_TITLE "GraphQL Playground"

EXPOSE 8080
CMD [ "node", "index.js" ]