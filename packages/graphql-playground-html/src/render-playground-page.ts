import getLoadingMarkup from './get-loading-markup'
import { GraphQLConfigData } from 'graphql-config'

export interface MiddlewareOptions {
  endpoint?: string
  subscriptionEndpoint?: string
  workspaceName?: string
  env?: any
  config?: GraphQLConfigData
  settings?: ISettings
  schema?: IntrospectionResult
  tabs?: Tab[]
  codeTheme?: EditorColours
}

export type Theme = 'dark' | 'light'
export interface ISettings {
  'general.betaUpdates': boolean
  'editor.theme': Theme
  'editor.reuseHeaders': boolean
  'tracing.hideTracingResponse': boolean
  'editor.fontSize': number
  'editor.fontFamily': string
  'request.credentials': string
}

export interface EditorColours {
  property: string
  comment: string
  punctuation: string
  keyword: string
  def: string
  qualifier: string
  attribute: string
  number: string
  string: string
  builtin: string
  string2: string
  variable: string
  meta: string
  atom: string
  ws: string
  selection: string
  cursorColor: string
  editorBackground: string
  resultBackground: string
  leftDrawerBackground: string
  rightDrawerBackground: string
}

export interface IntrospectionResult {
  __schema: any
}

export interface RenderPageOptions extends MiddlewareOptions {
  version: string
  env?: any
}

export interface Tab {
  endpoint: string
  query: string
  variables?: string
  responses?: string[]
  headers?: { [key: string]: string }
}

const loading = getLoadingMarkup()

const getCdnMarkup = options => `
    <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/graphql-playground-react@${
      options.version
    }/build/static/css/index.css" />
    <link rel="shortcut icon" href="//cdn.jsdelivr.net/npm/graphql-playground-react@${
      options.version
    }/build/favicon.png" />
    <script src="//cdn.jsdelivr.net/npm/graphql-playground-react@${
      options.version
    }/build/static/js/middleware.js"></script>
`

export function renderPlaygroundPage(options: RenderPageOptions) {
  const extendedOptions: any = {
    ...options,
    canSaveConfig: false,
  }
  // for compatibility
  if ((options as any).subscriptionsEndpoint) {
    extendedOptions.subscriptionEndpoint = (options as any).subscriptionsEndpoint
  }
  if (options.config) {
    extendedOptions.configString = JSON.stringify(options.config, null, 2)
  }
  if (!extendedOptions.endpoint && !extendedOptions.configString) {
    /* tslint:disable-next-line */
    console.warn(
      `WARNING: You didn't provide an endpoint and don't have a .graphqlconfig. Make sure you have at least one of them.`,
    )
  }

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset=utf-8 />
    <meta name="viewport" content="user-scalable=no, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, minimal-ui">
    <link rel="shortcut icon" href="https://graphcool-playground.netlify.com/favicon.png">
    <title>${extendedOptions.title || 'GraphQL Playground'}</title>
    ${
      extendedOptions.env === 'react' || extendedOptions.env === 'electron'
        ? ''
        : getCdnMarkup(extendedOptions)
    }
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
    ${loading.container}
    <div id="root" />
    <script type="text/javascript">
      window.addEventListener('load', function (event) {
        ${loading.script}
  
        const root = document.getElementById('root');
        root.classList.add('playgroundIn');
  
        GraphQLPlayground.init(root, ${JSON.stringify(
          extendedOptions,
          null,
          2,
        )})
      })
    </script>
  </body>
  </html>
`
}
