import renderLoading from './render-loading'

export interface MiddlewareOptions {
  endpoint: string
  subscriptionEndpoint?: string
  version: string
  isLocal: boolean
}

export default function renderPlaygroundPage(options: MiddlewareOptions) {
  const loading = renderLoading()

  return `
  <!DOCTYPE html>
<html>

<head>
  <meta charset=utf-8 />
  <meta name="viewport" content="user-scalable=no, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, minimal-ui">
  <title>GraphQL Playground</title>
  <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/graphql-playground@${
    options.version
  }/build/static/css/index.css"
  />
  <link rel="shortcut icon" href="//cdn.jsdelivr.net/npm/graphql-playground@${
    options.version
  }/build/favicon.png" />
  <script src="//cdn.jsdelivr.net/npm/graphql-playground@${
    options.version
  }/build/static/js/middleware.js"></script>
</head>

<body>
  <style type="text/css">
  html {
    font-family: "Open Sans", sans-serif;
    overflow: hidden;
  }
  
  body {
    margin: 0;
    background: #172a3a;
  }

  .playgroundIn {
    -webkit-animation: playgroundIn 0.5s ease-out forwards;
    animation: playgroundIn 0.5s ease-out forwards;
  }
  
  @-webkit-keyframes playgroundIn {
    from {
      opacity: 0;
      -webkit-transform: translateY(10px);
      -ms-transform: translateY(10px);
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      -webkit-transform: translateY(0);
      -ms-transform: translateY(0);
      transform: translateY(0);
    }
  }
  
  @keyframes playgroundIn {
    from {
      opacity: 0;
      -webkit-transform: translateY(10px);
      -ms-transform: translateY(10px);
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      -webkit-transform: translateY(0);
      -ms-transform: translateY(0);
      transform: translateY(0);
    }
  }
  </style>
  ${options.isLocal ? '' : loading.container}
  <div id="root" />
  <script type="text/javascript">
    window.addEventListener('load', function (event) {
      ${options.isLocal ? '' : loading.script}
      
      const root = document.getElementById('root');
      root.classList.add('playgroundIn');
      
      GraphQLPlayground.init(root, ${JSON.stringify(options, null, 2)})
    })
  </script>
</body>

</html>`
}
