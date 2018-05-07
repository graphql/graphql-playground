import * as React from 'react'
import { remote, ipcRenderer, webFrame } from 'electron'
import * as cx from 'classnames'
import { Playground as IPlayground } from 'graphql-playground-react/lib/components/Playground'
import { merge, set } from 'immutable'
import Playground, {
  openSettingsTab,
  selectNextTab,
  selectPrevTab,
  closeSelectedTab,
  fetchSchema,
  newSession,
  store,
  getSessionsState,
  saveFile,
  newFileTab,
  getEndpoint,
  selectAppHistoryItem,
  AppHistoryItem,
} from 'graphql-playground-react'
import {
  getGraphQLConfig,
  findGraphQLConfigFile,
  GraphQLConfigData,
  resolveEnvsInValues,
} from 'graphql-config'
import { createRemoteWindow } from '../../shared/utils'
import InitialView from './InitialView/InitialView'
import * as minimist from 'minimist'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import * as yaml from 'js-yaml'
import * as findUp from 'find-up'
import { patchEndpointsToConfigData as patchPrismaEndpointsToConfigData } from 'graphql-config-extension-prisma'
import { patchEndpointsToConfigData } from 'graphql-config-extension-graphcool'
import { connect } from 'react-redux'
import { errify } from '../utils/errify'
import { createStructuredSelector } from 'reselect'
import * as dotenv from 'dotenv'

// import { PermissionSession } from 'graphql-playground/lib/types'

const { dialog } = remote

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

interface ReduxProps {
  openSettingsTab: () => void
  selectNextTab: () => void
  selectPrevTab: () => void
  closeSelectedTab: () => void
  fetchSchema: () => void
  newSession: (endpoint: string) => void
  saveFile: () => void
  newFileTab: (fileName: string, filePath: string, file: string) => void
  selectAppHistoryItem: (item: AppHistoryItem) => void
  endpoint: string
}

class App extends React.Component<ReduxProps, State> {
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
      const envPath = path.join(folderPath, '.env')
      let env = process.env
      if (fs.existsSync(envPath)) {
        const envString = fs.readFileSync(envPath)
        const localEnv = dotenv.parse(envString)
        if (localEnv) {
          env = merge(env, localEnv)
        }
      }
      const configPath = findGraphQLConfigFile(folderPath)
      const configString = fs.readFileSync(configPath, 'utf-8')

      /* tslint:disable-next-line */
      //       if (configString.includes('${env:')) {
      //         errify(`You opened a .graphqlconfig file that includes environment variables.
      // In order to use environment variables in the Playground, please start it from the graphql cli. Install with
      // npm install -g graphql-cli
      // Then open the graphql config with:
      // cd ${folderPath}; graphql playground`)
      //       }

      const configDir = path.dirname(configPath)
      let config = await patchEndpointsToConfigData(
        resolveEnvsInValues(
          getGraphQLConfig(path.dirname(configPath)).config,
          env,
        ),
        configDir,
        env,
      )
      config = await patchPrismaEndpointsToConfigData(
        resolveEnvsInValues(
          getGraphQLConfig(path.dirname(configPath)).config,
          env,
        ),
        configDir,
        env,
      )

      ipcRenderer.send(
        'cwd',
        JSON.stringify({ cwd: configDir, id: remote.getCurrentWindow().id }),
      )
      const state = {
        configString,
        configPath,
        config,
        folderName: path.basename(folderPath),
        env,
      }
      this.setState(state as State)
      this.props.selectAppHistoryItem(merge(state, {
        type: 'local',
        path: configPath,
      }) as any)
    } catch (error) {
      errify(error)
    }
  }

  handleOpenNewWindow = () => {
    createRemoteWindow()
  }

  openSettingsTab = () => {
    this.props.openSettingsTab()
  }

  nextTab = () => {
    this.props.selectNextTab()
  }

  prevTab = () => {
    this.props.selectPrevTab()
  }

  newTab = () => {
    this.props.newSession(this.props.endpoint)
  }

  closeTab = () => {
    this.props.closeSelectedTab()
  }

  reloadSchema = () => {
    this.props.fetchSchema()
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
    // if (
    //   !this.state.endpoint &&
    //   !this.state.config &&
    //   !this.state.configPath &&
    //   !this.state.configString
    // ) {
    //   const workspace = this.deserializeWorkspace()
    //   if (workspace) {
    //     this.setState(workspace)
    //   }
    // }
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
    } else if (e.key >= 1 && e.key <= 9 && e.metaKey) {
      this.playground.switchTab(e.key)
    } else if (e.key === '=' && e.metaKey) {
      const zoom = webFrame.getZoomFactor()
      webFrame.setZoomFactor(zoom + 0.1)
    } else if (e.key === '-' && e.metaKey) {
      const zoom = webFrame.getZoomFactor()
      webFrame.setZoomFactor(zoom - 0.1)
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
      // use the endpoint as an alternative, only log the error
      try {
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
        const resolvedConfig = resolveEnvsInValues(rawConfig, input.env)
        config = await patchEndpointsToConfigData(
          resolvedConfig,
          input.cwd,
          input.env,
        )
        config = await patchPrismaEndpointsToConfigData(
          resolvedConfig,
          input.cwd,
          input.env,
        )

        if (!this.configContainsEndpoints(config)) {
          const graphcoolNote = configString.includes('graphcool')
            ? 'Please make sure to add stages to your graphcool.yml'
            : ''
          errify(
            `${configPath} does not include any endpoints. ${graphcoolNote}`,
          )
          return
        }
      } catch (e) {
        errify(e)
      }
    }

    ipcRenderer.send(
      'cwd',
      JSON.stringify({ cwd: input.cwd, id: remote.getCurrentWindow().id }),
    )

    const state = {
      configString,
      folderName,
      configPath,
      env: input.env,
      endpoint,
      config,
      platformToken,
    }

    this.props.selectAppHistoryItem(merge(state, {
      type: 'endpoint',
      path: configPath,
    }) as any)

    this.setState(state)
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
    this.props.newFileTab(path.basename(fileName), fileName, file)
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
        const session = getSessionsState(store.getState())
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
          this.props.saveFile()
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
        if (!this.state.endpoint && !this.state.config) {
          ipcRenderer.send(
            'CloseWindow',
            JSON.stringify({ id: remote.getCurrentWindow().id }),
          )
        } else {
          this.closeTab()
        }
        break
      case 'Settings':
        this.openSettingsTab()
        break
      case 'ReloadSchema':
        this.reloadSchema()
        break
    }
  }

  render() {
    const { theme, endpoint, platformToken, configString, config } = this.state

    return (
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
          selectHistory={this.handleSelectItem}
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
              configPath={this.state.configPath}
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
    )
  }

  private handleSelectItem = ({ type, ...item }) => {
    this.setState(item as any)
    this.props.selectAppHistoryItem(set(item, 'lastOpened', new Date()) as any)
  }

  private setRef = ref => {
    this.playground = ref
  }
}

const mapStateToProps = createStructuredSelector({
  endpoint: getEndpoint,
})

export default connect(mapStateToProps, {
  openSettingsTab,
  selectNextTab,
  selectPrevTab,
  closeSelectedTab,
  fetchSchema,
  newSession,
  saveFile,
  newFileTab,
  selectAppHistoryItem,
})(App)
