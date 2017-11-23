import * as React from 'react'
import { remote, ipcRenderer, ipcMain, protocol } from 'electron'
import { Provider } from 'react-redux'
import { Icon, $v } from 'graphcool-styles'
import * as cx from 'classnames'
import Playground, {
  Playground as IPlayground,
} from 'graphql-playground/lib/components/Playground'
import { getGraphQLConfig } from 'graphql-config'
import { createNewWindow } from './utils'
import createStore from './createStore'
import InitialView from './InitialView/InitialView'
import * as minimist from 'minimist'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import * as yaml from 'js-yaml'
import * as findUp from 'find-up'
import { PermissionSession } from 'graphql-playground/lib/types'

const { dialog } = remote

const store = createStore()
// declare var p: IPlayground

interface State {
  endpoint?: string
  openInitialView: boolean
  openTooltipTheme: boolean
  activeEndpoint?: {
    name: string
    url: string
  }
  theme: string
  projects?: any[]
  shareUrl?: string
  loading: boolean
  session?: any
  platformToken?: string
}

export default class ElectronApp extends React.Component<{}, State> {
  private playground: IPlayground

  constructor() {
    super()
    const { endpoint, platformToken } = this.getArgs()
    this.state = {
      openInitialView: !endpoint,
      openTooltipTheme: false,
      activeEndpoint: null,
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
      const config = getGraphQLConfig(folderPath)
      let projects = config.getProjects()
      // If no multi projects
      if (!projects) {
        projects = {}
        const project = config.getProjectConfig()
        // Take the folder name as a key
        const pathSplit = folderPath.split('/')
        const folderName = pathSplit[pathSplit.length - 1]
        projects[folderName] = project
      }
      // Get all enpoints for the project
      const projectsState = Object.keys(projects).map(key => {
        const project = projects[key]
        const endpoints = project.endpointsExtension.getRawEndpointsMap()
        const endpointsState = Object.keys(endpoints).map(a => {
          const endpoint: any = endpoints[a]
          endpoint.name = a
          return endpoint
        })
        return {
          name: key,
          endpoints: endpointsState,
        }
      })

      // Select first enpoind found
      const activeEndpoint = projectsState[0].endpoints[0]

      this.setState({
        openInitialView: false,
        activeEndpoint,
        endpoint: activeEndpoint.url,
        projects: projectsState,
      } as State)
    } catch (error) {
      alert(error)
    }
  }

  handleChangeItem = activeEndpoint => {
    const endpoint = activeEndpoint.url
    this.setState({ activeEndpoint, endpoint } as State)
  }

  handleToggleTooltipTheme = e => {
    this.setState({ openTooltipTheme: !this.state.openTooltipTheme } as State)
  }

  handleChangeTheme = () => {
    this.setState({
      theme: this.state.theme === 'dark' ? 'light' : 'dark',
    } as State)
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

    if (rc && rc.platformToken) {
      this.setState({ platformToken: rc.platformToken }, () => {
        this.playground.fetchPermissionSchema()
        this.playground.fetchServiceInformation()
      })
      localStorage.setItem('platformToken', rc.platformToken)
    }

    const permissionSession = this.getPermissionSessionForPath(fileToOpen)

    this.playground.newPermissionTab(
      permissionSession,
      path.basename(fileToOpen),
      fileToOpen,
      query,
    )
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

  getPermissionSessionForPath(fileName: string): PermissionSession | null {
    const graphcoolYml = this.getGraphcoolYml(fileName)
    if (graphcoolYml) {
      const { yml, ymlPath } = graphcoolYml
      const ymlDir = path.dirname(ymlPath)
      const permissionDefinition = yml.permissions.find(permission => {
        if (permission.query && permission.query.includes('graphql')) {
          const normalizedQuery = permission.query.split(':')[0]
          const resolvedPath = path.join(ymlDir, normalizedQuery)
          return resolvedPath === fileName
        }
        return false
      })

      if (permissionDefinition) {
        const { operation } = permissionDefinition

        const splitted = operation.split('.')
        if (['create', 'read', 'update', 'delete'].indexOf(splitted[1]) > -1) {
          return {
            modelName: splitted[0],
          }
        } else {
          return {
            relationName: splitted[0],
          }
        }
      }
    }

    return null
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
      projects,
      endpoint,
      openInitialView,
      openTooltipTheme,
      activeEndpoint,
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
            .app-content {
              @p: .flex, .flexRow;
            }

            .app-content .left-content {
              @p: .white, .relative, .mr6, .bgDarkBlue40;
              flex: 0 222px;
              padding-top: 57px;
            }
            .app-content .left-content.light {
              @p: .bgWhite70, .black60;
            }
            .app-content .list {
              @p: .overflowHidden;
              max-width: 222px;
            }
            .left-content .list-item {
              @p: .pv10, .ph25, .fw6, .toe, .overflowHidden, .nowrap;
            }
            .left-content .list-item.list-item-project {
              @p: .pointer, .pl38, .f12;
            }
            .left-content .list-item.list-item-project.active {
              @p: .bgDarkBlue, .bGreen;
              border-left-style: solid;
              border-left-width: 4px;
              padding-left: 34px;
            }
            .left-content.light .list-item.list-item-project.active {
              background-color: #e7e8ea;
            }
            .app-content .playground {
              @p: .flex1;
            }
            .sidenav-footer {
              @p: .absolute, .bottom0, .w100, .flex, .itemsCenter,
                .justifyBetween, .pv20, .bgDarkBlue;
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
          {endpoint && (
            <div className={cx('app-content', { 'app-endpoint': !projects })}>
              {projects && (
                <div className={cx('left-content', theme)}>
                  <div className="list">
                    {projects.map(project => (
                      <div key={project.name}>
                        <div className={cx('list-item')}>{project.name}</div>
                        {project.endpoints.map(ept => (
                          <div
                            key={ept.name}
                            className={cx('list-item list-item-project', {
                              active: activeEndpoint === ept,
                            })}
                            // tslint:disable-next-line
                            onClick={() => this.handleChangeItem(ept)}
                          >
                            {ept.name}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  <div className="sidenav-footer">
                    <button
                      className="button"
                      onClick={this.handleOpenNewWindow}
                    >
                      <Icon
                        src={require('graphcool-styles/icons/stroke/add.svg')}
                        stroke={true}
                        color={$v.gray90}
                        width={14}
                        height={14}
                        strokeWidth={6}
                      />
                      NEW WINDOW
                    </button>
                  </div>
                </div>
              )}
              <div className="playground">
                <Playground
                  getRef={this.setRef}
                  endpoint={endpoint}
                  isApp={!projects}
                  onChangeEndpoint={this.handleChangeEndpoint}
                  share={this.share}
                  shareUrl={this.state.shareUrl}
                  adminAuthToken={platformToken}
                />
              </div>
            </div>
          )}
        </div>
      </Provider>
    )
  }

  private share = (session: any) => {
    fetch('https://api.graph.cool/simple/v1/cj81hi46q03c30196uxaswrz2', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
        mutation ($session: String! $endpoint: String!) {
          addSession(session: $session endpoint: $endpoint) {
            id
          }
        }
      `,
        variables: {
          session: JSON.stringify(session),
          endpoint: this.state.endpoint,
        },
      }),
    })
      .then(res => res.json())
      .then(res => {
        const shareUrl = `https://graphqlbin.com/${res.data.addSession.id}`
        // const shareUrl = `${location.origin}/${res.data.addSession.id}`
        this.setState({ shareUrl })
      })
  }

  private setRef = ref => {
    this.playground = ref
  }

  private handleChangeEndpoint = endpoint => {
    this.setState({ endpoint })
  }
}
