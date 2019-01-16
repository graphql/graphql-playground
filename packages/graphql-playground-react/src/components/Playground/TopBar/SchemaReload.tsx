import * as React from 'react'
import ReloadIcon from './Reload'
import PollingIcon from './Polling'

export interface Props {
  isPollingSchema: boolean
  isReloadingSchema: boolean
  onReloadSchema: () => any
}

export default (props: Props) => {
  if (props.isPollingSchema) {
    return (
      <PollingIcon
        isPollingSchema={props.isPollingSchema}
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
