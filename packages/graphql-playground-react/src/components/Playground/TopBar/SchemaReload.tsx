import * as React from 'react'
import ReloadIcon from './Reload'
import Polling from './Polling'
import { ISettings } from '../../../types'
import { createStructuredSelector } from 'reselect'
import { getIsReloadingSchema } from '../../../state/sessions/selectors'
import { connect } from 'react-redux'

export interface Props {
  isPollingSchema: boolean
  isReloadingSchema: boolean
  onReloadSchema: () => any
  settings: ISettings
}

const SchemaReload = (props: Props) => {
  if (props.isPollingSchema) {
    return (
      <Polling
        interval={props.settings['schema.polling.interval']}
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

const mapStateToProps = createStructuredSelector({
  isReloadingSchema: getIsReloadingSchema,
})

export default connect(mapStateToProps)(SchemaReload)
