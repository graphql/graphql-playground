export type FILES = 'set files'
export const FILES: FILES = 'set files'

export interface SetFilesAction {
  type: FILES
  files: Files[]
}

export interface Files {
  name: string
  path: string
  isDirty: boolean
}

export const setFiles = (files: Files[]): SetFilesAction => {
  return {
    type: FILES,
    files
  }
}
