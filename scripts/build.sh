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
  echo "Building ${pkg}"
  yarn build
  cd ..
done