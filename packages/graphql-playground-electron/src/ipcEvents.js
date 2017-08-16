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

    } else {
      store.dispatch({
        type: FILES,
        files: data
      })
    }
  })

  // receives file save response
  ipcRenderer.on('file-saved', (event, data) => {
    if (data.error) {

    } else {

    }
  })

  // receives file content
  ipcRenderer.on('content-loaded', (event, data) => {
    console.log(data)
    if (data.error) {

    } else {

    }
  })
}