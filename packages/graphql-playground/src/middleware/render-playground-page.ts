export interface MiddlewareOptions {
  endpointUrl: string
  subscriptionUrl?: string
  version: string
}

export default function renderPlaygroundPage(options: MiddlewareOptions) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset=utf-8 />
  <meta name="viewport" content="user-scalable=no, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, minimal-ui">
  <title>Graphcool Playground</title>
  <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/graphql-playground@${options.version}/build/static/css/main.css" />
  <script src="//cdn.jsdelivr.net/npm/graphql-playground@${options.version}/build/static/js/main.js"></script>
</head>
<body>
  <div id="root">
    <style>
      body {
        background-color: rgb(23,42,58);
        font-family: Open Sans,sans-serif;
        height: 90vh;
      }
      #root {
        height: 100%;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .loading {
        font-size: 32px;
        font-weight: 200;
        color: rgba(255,255,255,.6);
        margin-right: 20px;
      }
    </style>
    <div class="loading">
      Loading Playground
    </div>
    <svg width="50px" height="50px" viewBox="0 0 50 50">
      <path d="M38.87,18.81c-1.77-1-4,0.3-4.35,0.53l-7.65,4.35c-1.29-1.03-3.17-0.81-4.19,0.48
c-1.03,1.29-0.81,3.18,0.48,4.2c1.29,1.03,3.17,0.81,4.19-0.48c0.53-0.67,0.75-1.54,0.6-2.38l7.63-4.34l0.05-0.03
c0.5-0.32,1.66-0.79,2.21-0.48c0.39,0.22,0.62,0.96,0.63,2.05h-0.01v9.59c0,0.89-0.48,1.72-1.25,2.17L26.25,40.8
c-0.77,0.45-1.72,0.45-2.5,0l-10.96-6.35c-0.77-0.45-1.25-1.27-1.25-2.17V19.6c0-0.89,0.48-1.72,1.25-2.17l9.92-5.74
c1.08,1.24,2.97,1.37,4.21,0.29c1.24-1.08,1.37-2.97,0.29-4.22C26.12,6.53,24.24,6.4,23,7.48c-0.64,0.55-1.01,1.35-1.02,2.2
L11.74,15.6c-1.43,0.83-2.31,2.35-2.31,4v12.68c0,1.65,0.88,3.18,2.3,4l10.96,6.35c1.43,0.82,3.18,0.82,4.61,0l10.96-6.35
c1.42-0.83,2.3-2.35,2.3-4v-9.22h0.01C40.63,20.91,40.05,19.47,38.87,18.81" fill="#27AE60"/>
    </svg>
  </div>
  <script>
    window.addEventListener('load', function(event) {
      GraphQLPlayground.init(document.getElementById('root'), {
        endpointUrl: "${options.endpointUrl}",
        ${options.subscriptionUrl &&
          `subscriptionUrl: "${options.subscriptionUrl}"`}
      })
    })
  </script>
</body>
</html>
`
}
