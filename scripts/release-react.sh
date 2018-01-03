#!/bin/bash

set -e

cd packages

middlewares=(
  graphql-playground-middleware-express
  # graphql-playground-middleware-hapi
  # graphql-playground-middleware-koa
  # graphql-playground-middleware-lambda
)

cd graphql-playground-react
echo "Releasing graphql-playground-react..."
npm version patch --no-git-tag-version
npm publish
version=$(cat package.json | jq -r '.version')
cd ..

for middleware in "${middlewares[@]}"
do
  cd $middleware
  echo "Releasing ${middleware}..."
  yarn add graphql-playground-react@$version
  npm version patch --no-git-tag-version
  npm publish
  cd ..
done

cd graphql-playground-electron
echo "Updating dependency & version in graphql-playground-electron..."
yarn add graphql-playground-react@$version
npm version patch --no-git-tag-version
cd ..

echo "Updating JSDeliver cache..."
curl -X POST \
  http://purge.jsdelivr.net/ \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
	"path": [
		"/npm/graphql-playground-react/middleware-build/static/css/main.css",
		"/npm/graphql-playground-react/middleware-build/static/js/main.js"
	]
}'