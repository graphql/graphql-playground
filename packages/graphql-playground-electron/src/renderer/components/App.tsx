import * as React from 'react'
import { remote, ipcRenderer } from 'electron'
import { Provider } from 'react-redux'
import * as cx from 'classnames'
import { Playground as IPlayground } from 'graphql-playground/lib/components/Playground'
import Playground from 'graphql-playground'
import {
  getGraphQLConfig,
  findGraphQLConfigFile,
  GraphQLConfigData,
  resolveEnvsInValues,
} from 'graphql-config'
import { createRemoteWindow } from '../../shared/utils'
import createStore from '../redux/createStore'
import InitialView from './InitialView/InitialView'
import * as minimist from 'minimist'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import * as yaml from 'js-yaml'
import * as findUp from 'find-up'
import { patchEndpointsToConfig } from 'graphql-config-extension-graphcool'
// import { PermissionSession } from 'graphql-playground/lib/types'

const { dialog } = remote

const store = createStore()
// declare var p: IPlayground

interface State {
  endpoint?: string
  openTooltipTheme: boolean
  theme: string
  shareUrl?: string
  loading: boolean
  session?: any
  platformToken?: string
  configString?: string
  configPath?: string

  folderName?: string
  env?: any
  config?: GraphQLConfigData
}

ipcRenderer.on('SettingsRequest', () => {
  ipcRenderer.send('SettingsResponse', localStorage.getItem('settings'))
})

const events: any[] = []

ipcRenderer.on('OpenSelectedFile', pushSelectedFile)
ipcRenderer.on('OpenUrl', pushOpenUrl)

function pushSelectedFile() {
  events.push({
    type: 'OpenSelectedFile',
    args: arguments,
  })
}

function pushOpenUrl() {
  events.push({
    type: 'OpenUrl',
    args: arguments,
  })
}

export default class App extends React.Component<{}, State> {
  private playground: IPlayground

  constructor(props) {
    super(props)
    const { endpoint, platformToken } = this.getArgs()
    this.state = {
      openTooltipTheme: false,
      theme: 'dark',
      endpoint,
      platformToken,
      loading: false,
    }
    ;(global as any).a = this
    ;(global as any).r = remote
  }

  fileAdded = event => {
    // console.log(event)
  }

  getArgs(): any {
    const argv = remote.process.argv
    const args = minimist(argv.slice(1))

    return {
      endpoint: args.endpoint,
      subscriptionsEndpoint: args['subscriptions-endpoint'],
      platformToken: args['platform-token'] || localStorage.platformToken,
      env: args.env,
    }
  }

  handleSelectEndpoint = (endpoint: string) => {
    this.setState({ endpoint } as State)
  }

  handleSelectFolder = async (folderPath: string) => {
    try {
      // Get config from folderPath
      const configPath = findGraphQLConfigFile(folderPath)
      const configString = fs.readFileSync(configPath, 'utf-8')

      /* tslint:disable-next-line */
      if (configString.includes('${env:')) {
        alert(`You opened a .graphqlconfig file that includes environment variables.
In order to use environment variables in the Playground, please start it from the graphql cli. Install with
npm install -g graphql-cli
Then open the graphql config with:
cd ${folderPath}; graphql playground`)
      }

      const configDir = path.dirname(configPath)
      const config = await patchEndpointsToConfig(
        resolveEnvsInValues(
          getGraphQLConfig(path.dirname(configPath)).config,
          process.env,
        ),
        configDir,
        process.env,
      )

      ipcRenderer.send(
        'cwd',
        JSON.stringify({ cwd: configDir, id: remote.getCurrentWindow().id }),
      )
      this.setState({
        configString,
        configPath,
        config,
        folderName: path.basename(folderPath),
      } as State)
    } catch (error) {
      alert(error)
    }
  }

  handleOpenNewWindow = () => {
    createRemoteWindow()
  }

  openSettingsTab = () => {
    if (this.playground) {
      this.playground.openSettingsTab()
    }
  }

  nextTab = () => {
    if (this.playground) {
      this.playground.nextTab()
    }
  }

  prevTab = () => {
    if (this.playground) {
      this.playground.prevTab()
    }
  }

  newTab = () => {
    if (this.playground) {
      ;(this.playground as any).handleNewSession()
    }
  }

  closeTab = () => {
    if (this.playground) {
      if (!this.playground.closeTab()) {
        ipcRenderer.send('async', 'close')
      }
    }
  }

  componentDidMount() {
    ipcRenderer.removeListener('OpenUrl', pushOpenUrl)
    ipcRenderer.removeListener('OpenSelectedFile', pushSelectedFile)
    ipcRenderer.on('Tab', this.readTabMessage)
    ipcRenderer.on('File', this.readFileMessage)
    ipcRenderer.on('OpenSelectedFile', this.readOpenSelectedFileMessage)
    ipcRenderer.on('OpenUrl', this.handleUrl)
    window.addEventListener('keydown', this.handleKeyDown, true)
    this.consumeEvents()
    ipcRenderer.send('ready', '')
  }

  consumeEvents() {
    while (events.length > 0) {
      const event = events.shift()
      switch (event.type) {
        case 'OpenSelectedFile':
          return this.readOpenSelectedFileMessage.call(this, ...event.args)
        case 'OpenUrl':
          return this.handleUrl.call(this, ...event.args)
      }
    }
  }

  componentWillUnmount() {
    ipcRenderer.removeListener('Tab', this.readTabMessage)
    ipcRenderer.removeListener('File', this.readFileMessage)
    ipcRenderer.removeListener(
      'OpenSelectedFile',
      this.readOpenSelectedFileMessage,
    )
    ipcRenderer.removeListener('OpenUrl', this.handleUrl)
    window.removeEventListener('keydown', this.handleKeyDown, true)
  }

  handleKeyDown = e => {
    if (e.key === '{' && e.metaKey) {
      this.prevTab()
    } else if (e.key === '}' && e.metaKey) {
      this.nextTab()
    }
  }

  handleUrl = async (event, msg) => {
    const input = JSON.parse(msg)

    const endpoint = input.endpoint
    let configString
    let folderName
    let configPath
    const platformToken = input.platformToken
    let config

    if (input.cwd) {
      configPath = findUp.sync(['.graphqlconfig', '.graphqlconfig.yml'], {
        cwd: input.cwd,
      })
      configString = configPath
        ? fs.readFileSync(configPath, 'utf-8')
        : undefined
      folderName = configPath
        ? path.basename(path.dirname(configPath))
        : undefined
      const rawConfig = getGraphQLConfig(input.cwd).config
      config = await patchEndpointsToConfig(
        resolveEnvsInValues(rawConfig, input.env),
        input.cwd,
        input.env,
      )

      if (!this.configContainsEndpoints(config)) {
        const graphcoolNote = configString.includes('graphcool')
          ? 'Please make sure to add stages to your graphcool.yml'
          : ''
        alert(`${configPath} does not include any endpoints. ${graphcoolNote}`)
        return
      }
    }

    ipcRenderer.send(
      'cwd',
      JSON.stringify({ cwd: input.cwd, id: remote.getCurrentWindow().id }),
    )

    this.setState({
      configString,
      folderName,
      configPath,
      env: input.env,
      endpoint,
      config,
      platformToken,
    })
  }

  configContainsEndpoints(config: GraphQLConfigData): boolean {
    if (
      Object.keys((config.extensions && config.extensions.endpoints) || {})
        .length > 0
    ) {
      return true
    }
    return Object.keys(config.projects).reduce((acc, curr) => {
      const project = config.projects[curr]
      if (
        project.extensions &&
        project.extensions.endpoints &&
        Object.keys(project.extensions.endpoints).length > 0
      ) {
        return true
      }

      return acc
    }, false)
  }

  readFileMessage = (event, message) => {
    switch (message) {
      case 'Open':
        this.showOpenDialog()
        break
      case 'Save':
        this.getSaveFileName()
        break
    }
  }

  readOpenSelectedFileMessage = (event, selectedFile) => {
    if (selectedFile) {
      this.openFile(selectedFile)
    }
  }

  async openFile(fileName: string) {
    const file = fs.readFileSync(fileName, 'utf-8')
    if (!this.playground) {
      this.handleSelectFolder(path.dirname(fileName))
    }
    while (!this.playground) {
      await new Promise(r => setTimeout(r, 200))
    }
    await new Promise(r => setTimeout(r, 200))
    this.playground.newFileTab(path.basename(fileName), fileName, file)
  }

  showOpenDialog() {
    dialog.showOpenDialog(
      {
        title: 'Choose a .graphql file to edit',
        properties: ['openFile'],
        // filters: [{
        //   name: '*',
        //   extensions: ['graphql']
        // }]
      },
      fileNames => {
        if (fileNames && fileNames.length > 0) {
          const file = fileNames[0]
          this.openFile(file)
        }
      },
    )
  }

  getSaveFileName(): Promise<string> {
    return new Promise((resolve, reject) => {
      // save current tab

      if (this.playground) {
        const session = this.playground.state.sessions[
          this.playground.state.selectedSessionIndex
        ]
        if (session.isConfigTab) {
          this.playground.handleSaveConfig()
        }

        if (session.isSettingsTab) {
          this.playground.handleSaveSettings()
        }

        if (session.isFile && session.filePath) {
          // TODO
          // dialog.showSaveDialog(
          //   {
          //     title: 'Save Permission Query',
          //     filters: [
          //       {
          //         name: 'Permission File',
          //         extensions: ['graphql'],
          //       },
          //     ],
          //   },
          //   (fileName: any) => {
          //     resolve(fileName)
          //   },
          // )
          this.playground.handleSaveFile(session.file)
          fs.writeFileSync(session.filePath, session.file)
        }

        this.playground.handleSaveConfig()
      }
    })
  }

  saveConfig = (configString: string) => {
    fs.writeFileSync(this.state.configPath, configString)
    this.setState({ configString })
  }

  // async saveFile() {
  //   const session = this.playground.state.sessions[
  //     this.playground.state.selectedSessionIndex
  //   ]
  //   ;(this.playground as any).setValueInSession(session.id, 'hasChanged', false)
  //   const fileName =
  //     (session as any).absolutePath || (await this.getSaveFileName())
  //   // if (!(session as any).absolutePath) {
  //   ;(this.playground as any).setValueInSession(
  //     session.id,
  //     'name',
  //     path.basename(fileName),
  //   )
  //   ;(this.playground as any).setValueInSession(
  //     session.id,
  //     'absolutePath',
  //     fileName,
  //   )
  //   // }
  //   const query = session.query
  //   fs.writeFileSync(fileName, query)
  // }

  getGraphcoolYml(from: string): { ymlPath: string; yml: any } | null {
    const ymlPath = findUp.sync('graphcool.yml', { cwd: from })
    if (ymlPath) {
      const file = fs.readFileSync(ymlPath)
      try {
        return {
          yml: yaml.safeLoad(file),
          ymlPath,
        }
      } catch (e) {
        // console.error(e)
      }
    }

    return null
  }

  getGraphcoolRc(): any | null {
    const graphcoolRc = path.join(os.homedir(), '.graphcoolrc')
    if (fs.existsSync(graphcoolRc)) {
      const file = fs.readFileSync(graphcoolRc)
      try {
        return yaml.safeLoad(file)
      } catch (e) {
        // console.error(e)
      }
    }

    return null
  }

  readTabMessage = (error, message) => {
    switch (message) {
      case 'Next':
        this.nextTab()
        break
      case 'Prev':
        this.prevTab()
        break
      case 'New':
        this.newTab()
        break
      case 'Close':
        this.closeTab()
        break
      case 'Settings':
        this.openSettingsTab()
        break
    }
  }

  render() {
    const { theme, endpoint, platformToken, configString, config } = this.state

    return (
      <Provider store={store}>
        <div className={cx('root', theme, { noConfig: !configString })}>
          <style jsx={true} global={true}>{`
            .app-content .left-content {
              letter-spacing: 0.5px;
            }
            body .root.noConfig .tabs {
              padding-left: 80px;
            }
          `}</style>
          <style jsx={true}>{`
            .root {
              @p: .flex, .flexColumn, .bgDarkestBlue, .overflowHidden;
            }
            .root.light {
              background-color: #dbdee0;
            }
            .app-content .playground {
              @p: .flex1;
            }
            .light .sidenav-footer {
              background-color: #eeeff0;
            }
            .sidenav-footer .button {
              @p: .br2, .black90, .pointer, .pa10, .fw6, .flex, .itemsCenter,
                .ml20;
            }
          `}</style>
          <InitialView
            isOpen={!endpoint && !configString}
            onSelectFolder={this.handleSelectFolder}
            onSelectEndpoint={this.handleSelectEndpoint}
          />
          {(endpoint || configString) && (
            <div className="playground">
              <Playground
                getRef={this.setRef}
                endpoint={endpoint}
                isElectron={true}
                platformToken={platformToken}
                configString={configString}
                config={config}
                onSaveConfig={this.saveConfig}
                canSaveConfig={true}
                env={this.state.env}
                folderName={this.state.folderName}
                showNewWorkspace={true}
                onNewWorkspace={this.handleOpenNewWindow}
              />
            </div>
          )}
        </div>
      </Provider>
    )
  }

  private setRef = ref => {
    this.playground = ref
  }
}
