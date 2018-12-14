FROM node:alpine

RUN mkdir /app
COPY server/index.js /app
COPY server/package.json /app

WORKDIR /app
RUN yarn

ENV PORT 8080
ENV ENDPOINT "http://localhost:3000/graphql"

EXPOSE 8080
CMD [ "node", "index.js" ]