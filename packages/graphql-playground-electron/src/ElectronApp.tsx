import * as React from 'react'
import { remote, ipcRenderer, ipcMain, protocol } from 'electron'
import { Provider } from 'react-redux'
import { Icon, $v } from 'graphcool-styles'
import * as cx from 'classnames'
import { Playground as IPlayground } from 'graphql-playground/lib/components/Playground'
import Playground from 'graphql-playground'
import { getGraphQLConfig, findGraphQLConfigFile } from 'graphql-config'
import { createNewWindow } from './utils'
import createStore from './createStore'
import InitialView from './InitialView/InitialView'
import * as minimist from 'minimist'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import * as yaml from 'js-yaml'
import * as findUp from 'find-up'
import * as queryString from 'query-string'
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
}

export default class ElectronApp extends React.Component<{}, State> {
  private playground: IPlayground

  constructor() {
    super()
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

  handleSelectFolder = (folderPath: string) => {
    try {
      // Get config from folderPath
      const configPath = findGraphQLConfigFile(folderPath)
      const configString = fs.readFileSync(configPath, 'utf-8')

      /* tslint:disable-next-line */
      if (configString.includes('${env:')) {
        alert(`You opened a .graphqlconfig file that includes environment variables.
In order to use environment variables in the Playground, please start it from the graphql cli. Install with
npm install -g graphql
Then open the graphql config with:
cd ${folderPath}; graphql playground`)
      }

      this.setState({
        configString,
        configPath,
        folderName: path.basename(folderPath),
      } as State)
    } catch (error) {
      alert(error)
    }
  }

  handleOpenNewWindow = () => {
    createNewWindow()
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
    ipcRenderer.on('Tab', this.readTabMessage)
    ipcRenderer.on('File', this.readFileMessage)
    ipcRenderer.on('OpenSelectedFile', this.readOpenSelectedFileMessage)
    ipcRenderer.on('OpenUrl', this.handleUrl)
    window.addEventListener('keydown', this.handleKeyDown)
  }

  componentWillUnmount() {
    ipcRenderer.removeListener('Tab', this.readTabMessage)
    ipcRenderer.removeListener('File', this.readFileMessage)
    ipcRenderer.removeListener(
      'OpenSelectedFile',
      this.readOpenSelectedFileMessage,
    )
    ipcRenderer.removeListener('OpenUrl', this.handleUrl)
    window.removeEventListener('keydown', this.handleKeyDown)
  }

  handleKeyDown = e => {
    if (e.key === '{' && e.metaKey) {
      this.prevTab()
    }
    if (e.key === '}' && e.metaKey) {
      this.nextTab()
    }
  }

  handleUrl = (event, url) => {
    const cutIndex = url.indexOf('//')
    const query = url.slice(cutIndex + 2)
    const input = queryString.parse(query)
    if (input.env) {
      try {
        input.env = JSON.parse(input.env)
      } catch (e) {
        //
      }
    }

    const endpoint = input.endpoint
    let configString
    let folderName
    let configPath
    const platformToken = input.platformToken

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
    }

    this.setState({
      configString,
      folderName,
      env: input.env,
      endpoint,
      platformToken,
    })
  }

  readFileMessage = (event, message) => {
    switch (message) {
      case 'Open':
        this.showOpenDialog()
        break
      case 'Save':
        this.saveFile()
        break
    }
  }

  readOpenSelectedFileMessage = (event, selectedFile) => {
    if (selectedFile) {
      this.openFile(selectedFile)
    }
  }

  openFile(fileToOpen: string) {
    const query = fs.readFileSync(fileToOpen, 'utf-8')
    const rc = this.getGraphcoolRc()
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
      dialog.showSaveDialog(
        {
          title: 'Save Permission Query',
          filters: [
            {
              name: 'Permission File',
              extensions: ['graphql'],
            },
          ],
        },
        (fileName: any) => {
          resolve(fileName)
        },
      )
    })
  }

  saveConfig = (configString: string) => {
    fs.writeFileSync(this.state.configPath, configString)
    this.setState({ configString })
  }

  async saveFile() {
    const session = this.playground.state.sessions[
      this.playground.state.selectedSessionIndex
    ]
    ;(this.playground as any).setValueInSession(session.id, 'hasChanged', false)
    const fileName =
      (session as any).absolutePath || (await this.getSaveFileName())
    // if (!(session as any).absolutePath) {
    ;(this.playground as any).setValueInSession(
      session.id,
      'name',
      path.basename(fileName),
    )
    ;(this.playground as any).setValueInSession(
      session.id,
      'absolutePath',
      fileName,
    )
    // }
    const query = session.query
    fs.writeFileSync(fileName, query)
  }

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
    }
  }

  render() {
    const {
      theme,
      endpoint,
      openTooltipTheme,
      platformToken,
      configString,
    } = this.state

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
                onSaveConfig={this.saveConfig}
                canSaveConfig={true}
                env={this.state.env}
                folderName={this.state.folderName}
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

  private handleChangeEndpoint = endpoint => {
    this.setState({ endpoint })
  }
}
