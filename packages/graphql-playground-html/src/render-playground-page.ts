import getLoadingMarkup from './get-loading-markup'

export interface MiddlewareOptions {
  endpoint?: string
  subscriptionEndpoint?: string
  workspaceName?: string
  env?: any
  config?: any
  settings?: ISettings
  schema?: IntrospectionResult
  tabs?: Tab[]
  codeTheme?: EditorColours
}

export type CursorShape = 'line' | 'block' | 'underline'
export type Theme = 'dark' | 'light'

export interface ISettings {
  'general.betaUpdates': boolean
  'editor.cursorShape': CursorShape
  'editor.theme': Theme
  'editor.reuseHeaders': boolean
  'tracing.hideTracingResponse': boolean
  'editor.fontSize': number
  'editor.fontFamily': string
  'request.credentials': string
  'request.globalHeaders': { [key: string]: string; }
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
  version?: string
  cdnUrl?: string
  env?: any
  title?: string
  faviconUrl?: string | null
}

export interface Tab {
  endpoint: string
  query: string
  variables?: string
  responses?: string[]
  headers?: { [key: string]: string }
}

const loading = getLoadingMarkup()

const getCdnMarkup = ({ version, cdnUrl = '//cdn.jsdelivr.net/npm', faviconUrl }) => `
    <link rel="stylesheet" href="${cdnUrl}/graphql-playground-react${
  version ? `@${version}` : ''
}/build/static/css/index.css" />
    ${typeof faviconUrl === 'string' ? `<link rel="shortcut icon" href="${faviconUrl}" />` : ''}
    ${faviconUrl === undefined ? `<link rel="shortcut icon" href="${cdnUrl}/graphql-playground-react${
      version ? `@${version}` : ''
    }/build/favicon.png" />` : ''}
    <script src="${cdnUrl}/graphql-playground-react${
  version ? `@${version}` : ''
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
    <link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700|Source+Code+Pro:400,700" rel="stylesheet">
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
