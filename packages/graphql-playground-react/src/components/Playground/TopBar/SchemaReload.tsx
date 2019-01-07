import * as React from 'react'
import ReloadIcon from './ReloadIcon'
import PollingIcon from './PollingIcon'

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
