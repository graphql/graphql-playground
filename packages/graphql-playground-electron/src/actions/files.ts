export type FILES = 'set files'
export const FILES: FILES = 'set files'

export type CONFIG = 'set config'
export const CONFIG: CONFIG = 'set config'

export interface SetFilesAction {
  type: FILES
  files: Files[]
}

export interface SetConfigAction {
  type: CONFIG
  config: Config
}

export interface Files {
  name: string
  path: string
  isDirty: boolean
}

export interface Config {
  configDir: string
  includes:  string[]
  excludes: string[]
  schemePath: string
}

export const setFiles = (files: Files[]): SetFilesAction => {
  return {
    type: FILES,
    files
  }
}

export const setConfig = (config: Config): SetConfigAction => {
  return {
    type: CONFIG,
    config
  }
}
