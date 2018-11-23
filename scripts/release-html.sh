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
yarn version --no-git-tag-version --new-version patch
yarn publish --non-interactive
version=$(cat package.json | jq -r '.version')
cd ..

for middleware in "${middlewares[@]}"
do
  cd $middleware
  echo "Releasing ${middleware}..."
  yarn add graphql-playground-html@$version
  yarn version --no-git-tag-version --new-version patch
  yarn publish --non-interactive
  cd ..
done
