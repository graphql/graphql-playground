#!/bin/bash

set -e

npm publish

curl -X POST \
  http://purge.jsdelivr.net/ \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
	"path": [
		"/npm/graphql-playground/middleware-build/static/css/main.css",
		"/npm/graphql-playground/middleware-build/static/js/main.js"
	]
}'

