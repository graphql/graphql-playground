import * as React from 'react'
import ReloadIcon from './ReloadIcon'

export interface Props {
  isReloadingSchema: boolean
  onReloadSchema?: () => void
}

const Reload: React.SFC<Props> = props => (
  <ReloadIcon
    animate={props.isReloadingSchema}
    onClick={props.onReloadSchema}
  />
)

export default Reload
