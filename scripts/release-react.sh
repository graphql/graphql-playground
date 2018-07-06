#!/bin/bash

set -e

cd packages

middlewares=(
  graphql-playground-middleware-express
  graphql-playground-middleware-hapi
  graphql-playground-middleware-koa
  graphql-playground-middleware-lambda
)

cd graphql-playground-react
yarn install
echo "Releasing graphql-playground-react..."
npm version patch --no-git-tag-version
npm publish
export version=$(cat package.json | jq -r '.version')
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

for middleware in "${middlewares[@]}"
do
  cd $middleware
  yarn install
  echo "Releasing ${middleware}..."
  cat package.json | jq ".playgroundVersion = \"$version\"" > package.tmp.json
  mv package.tmp.json package.json
  npm version patch --no-git-tag-version
  npm publish
  cd ..
done

cd graphql-playground-electron
echo "Updating dependency & version in graphql-playground-electron..."
yarn add graphql-playground-react@$version
npm version patch --no-git-tag-version
cd ..
