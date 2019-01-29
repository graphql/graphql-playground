import * as React from 'react'
import ReloadIcon from './Reload'
import Polling from './Polling'
import { ISettings } from '../../../types'

export interface Props {
  isPollingSchema: boolean
  isReloadingSchema: boolean
  onReloadSchema: () => any
  settings: ISettings
}

export default (props: Props) => {
  if (props.isPollingSchema) {
    return (
      <Polling
        interval={props.settings['schema.polling.interval']}
        isReloadingSchema={props.isReloadingSchema}
        onReloadSchema={props.onReloadSchema}
      />
    )
  }
  return (
    <ReloadIcon
      isReloadingSchema={props.isReloadingSchema}
      onReloadSchema={props.onReloadSchema}
    />
  )
}
