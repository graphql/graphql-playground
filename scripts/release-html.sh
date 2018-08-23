#!/bin/bash

if ! [ -x "$(command -v jq)" ]; then
  echo 'Error: jq is not installed.' >&2
  exit 1
fi

set -e

cd packages

middlewares=(
  graphql-playground-middleware-express
  graphql-playground-middleware-hapi
  graphql-playground-middleware-koa
  graphql-playground-middleware-lambda
)

cd graphql-playground-html
echo "Releasing graphql-playground-html..."
npm version patch --no-git-tag-version
npm publish
version=$(cat package.json | jq -r '.version')
cd ..

for middleware in "${middlewares[@]}"
do
  cd $middleware
  echo "Releasing ${middleware}..."
  yarn add graphql-playground-html@$version
  npm version patch --no-git-tag-version
  npm publish
  cd ..
done
