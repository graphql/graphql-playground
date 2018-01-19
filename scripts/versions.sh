#!/bin/bash

set -e

cd packages

packages=(
  graphql-playground-react
  graphql-playground-html
  graphql-playground-electron
  graphql-playground-middleware-express
  graphql-playground-middleware-hapi
  graphql-playground-middleware-koa
  graphql-playground-middleware-lambda
)

for pkg in "${packages[@]}"
do
  cd $pkg
  version=$(cat package.json | jq -r '.version')
  echo "$pkg: $version"
  cd ..
done