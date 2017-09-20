import {
  FILES
} from './actions/files';

export default function ipcEvents(ipcRenderer, store) {

  // receives file structure
  ipcRenderer.on('file-tree-changed', (event, {
    data,
    error
  }) => {
    if (data.error) {
      // TODO: needs UI Error element
    } else {
      store.dispatch({
        files: data,
        type: FILES
      })
    }
  })

  // receives file save response
  ipcRenderer.on('file-saved', (event, data) => {
    if (data.error) {
      // TODO: needs UI Error element
    } else {

    }
  })

  // receives file content
  ipcRenderer.on('content-loaded', (event, data) => {
    if (data.error) {
      // TODO: needs UI Error element
    } else {

    }
  })
}