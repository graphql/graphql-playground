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
// import { PermissionSession } from 'graphql-playground/lib/types'

const { dialog } = remote

const store = createStore()
// declare var p: IPlayground

interface State {
  endpoint?: string
  openInitialView: boolean
  openTooltipTheme: boolean
  theme: string
  shareUrl?: string
  loading: boolean
  session?: any
  platformToken?: string
  configString?: string
  configPath?: string
}

export default class ElectronApp extends React.Component<{}, State> {
  private playground: IPlayground

  constructor() {
    super()
    const { endpoint, platformToken } = this.getArgs()
    this.state = {
      openInitialView: !endpoint,
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
    }
  }

  handleSelectEndpoint = (endpoint: string) => {
    this.setState({ endpoint, openInitialView: false } as State)
  }

  handleSelectFolder = (folderPath: string) => {
    try {
      // Get config from folderPath
      const configPath = findGraphQLConfigFile(folderPath)
      const configString = fs.readFileSync(configPath, 'utf-8')

      this.setState({
        openInitialView: false,
        configString,
        configPath,
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
  }

  componentWillUnmount() {
    ipcRenderer.removeListener('Tab', this.readTabMessage)
    ipcRenderer.removeListener('File', this.readFileMessage)
    ipcRenderer.removeListener(
      'OpenSelectedFile',
      this.readOpenSelectedFileMessage,
    )
  }

  readFileMessage = (error, message) => {
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
      openInitialView,
      openTooltipTheme,
      platformToken,
    } = this.state

    return (
      <Provider store={store}>
        <div className={cx('root', theme)}>
          <style jsx={true} global={true}>{`
            .app-content .left-content {
              letter-spacing: 0.5px;
            }
            body .root .tabs.isApp {
              padding-left: 74px;
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
            isOpen={openInitialView}
            onSelectFolder={this.handleSelectFolder}
            onSelectEndpoint={this.handleSelectEndpoint}
          />
          {(endpoint || this.state.configString) && (
            <div className="playground">
              <Playground
                getRef={this.setRef}
                endpoint={endpoint}
                isElectron={true}
                platformToken={platformToken}
                configString={this.state.configString}
                onSaveConfig={this.saveConfig}
                canSaveConfig={true}
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
