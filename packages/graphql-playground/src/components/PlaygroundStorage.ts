import { Session } from '../types'
import { mapValues } from 'lodash'

export default class PlaygroundStorage {
  static countCache: { [endpoint: string]: number } = {}

  static getSessionCount(endpoint: string) {
    const cachedCount = this.countCache[endpoint]
    if (cachedCount) {
      return cachedCount
    }

    try {
      const projectString = localStorage.getItem(endpoint)
      if (projectString) {
        const project = JSON.parse(projectString)
        return Object.keys(project.sessions).length
      }
    } catch (e) {
      //
    }

    return 1
  }

  // migrate headers to new format
  private static runMigration(project, migrationEndpoint?: string) {
    if (!project) {
      return project
    }
    function mapHeaders(session) {
      let headers = session.headers
      if (!headers) {
        headers = ''
      }
      if (Array.isArray(headers)) {
        headers = convertArray(headers)
      }
      if (typeof headers === 'object') {
        headers = JSON.stringify(headers, null, 2)
      }
      return {
        ...session,
        headers,
        endpoint: session.endpoint || migrationEndpoint,
      }
    }

    function convertArray(headers) {
      return headers.reduce((acc, header) => {
        return {
          ...acc,
          [header.name]: header.value,
        }
      }, {})
    }

    const history = project.history
      ? project.history.map(s => mapHeaders(s))
      : []
    const sessions = mapValues(project.sessions, mapHeaders)

    return {
      ...project,
      sessions,
      history,
    }
  }
  project: any
  private endpoint: string
  private storages: any = {}
  private executedQueryCount: number

  constructor(endpoint: string) {
    this.endpoint = endpoint

    this.project = this.getProject()
    this.executedQueryCount = this.getExecutedQueryCount()

    if (!this.project) {
      this.project = {
        sessions: {},
        history: [],
        data: {},
      }
      this.saveProject()
    }
    PlaygroundStorage.countCache[endpoint] = Object.keys(
      this.project.sessions,
    ).length
    ;(global as any).s = this
  }

  public executedQuery() {
    if (!this.executedQueryCount) {
      this.executedQueryCount = 1
    } else {
      this.executedQueryCount++
    }
  }

  public hasExecutedQuery() {
    return this.executedQueryCount >= 2
  }

  public getSessionStorage(sessionId: string) {
    if (this.storages[sessionId]) {
      return this.storages[sessionId]
    }
    const prefix = `${this.endpoint}:${sessionId}:`
    const store = {
      clear: () => {
        Object.keys(localStorage)
          .filter((key: string) => key.startsWith(prefix))
          .forEach(key => localStorage.removeItem(key))
      },
      getItem: (key: string) => {
        return localStorage.getItem(prefix + key)
      },
      setItem: (key: string, item: string) => {
        return localStorage.setItem(prefix + key, item)
      },
      removeItem: (key: string) => {
        return localStorage.removeItem(prefix + key)
      },
    }
    this.storages[sessionId] = store
    return store
  }

  public setState(project: any, endpoint: string) {
    this.project = PlaygroundStorage.runMigration(project, endpoint)
  }

  public getSessions() {
    return Object.keys(this.project.sessions)
      .filter(key => key !== 'undefined')
      .map(sessionId => this.project.sessions[sessionId])
  }

  public removeSession(session: Session) {
    delete this.project.sessions[session.id]
  }

  public saveSession(session: Session, save: boolean = false) {
    this.project.sessions[session.id] = session
    if (save) {
      this.saveProject()
    }
  }

  public syncHistory(history: Session[]) {
    this.project.history = history
  }

  public addToHistory(session: Session) {
    // limit by 1000 items
    this.project.history.unshift(session)
    this.project.history = this.project.history.slice(0, 1000)
  }

  public getHistory(endpoint?: string) {
    if (!this.project.history) {
      return []
    }
    if (endpoint) {
      return this.project.history.filter(
        session => session.endpoint === endpoint,
      )
    }
    return this.project.history
  }

  public setItem(key: string, value: string) {
    this.project.data[key] = value
  }

  public getItem(key: string) {
    return this.project.data[key]
  }

  public saveProject() {
    const json = JSON.stringify(this.project)
    localStorage.setItem(this.endpoint, json)
    localStorage.setItem(
      'executedQueryCount',
      this.executedQueryCount.toString(),
    )
    PlaygroundStorage.countCache[this.endpoint] = Object.keys(
      this.project.sessions,
    ).length
  }

  private getProject() {
    let result: any = null
    try {
      result = JSON.parse(localStorage.getItem(this.endpoint) || '')
    } catch (e) {
      //
    }
    if (result && result.history) {
      result.history = result.history.map(item => ({
        ...item,
        date: new Date(item.date),
      }))
    }
    return PlaygroundStorage.runMigration(result)
  }

  private getExecutedQueryCount() {
    let count: number = 0

    try {
      count = parseInt(localStorage.getItem('executedQueryCount') || '0', 10)
    } catch (e) {
      //
    }

    return count
  }
}
