import * as React from 'react'
import PollingIcon from './PollingIcon'

export interface Props {
  interval: number
  isReloadingSchema: boolean
  onReloadSchema: () => void
}

class SchemaPolling extends React.Component<Props> {
  timer: any

  componentDidMount() {
    this.startPolling()
  }
  componentWillUnmount() {
    this.clearTimer()
  }
  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.isReloadingSchema !== this.props.isReloadingSchema) {
      this.startPolling(nextProps)
    }
  }

  render() {
    return <PollingIcon animate={true} />
  }
  private startPolling(props: Props = this.props) {
    this.clearTimer()
    if (!props.isReloadingSchema) {
      // timer starts only when introspection not in flight
      this.timer = setInterval(() => props.onReloadSchema(), props.interval)
    }
  }

  private clearTimer() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }
}

export default SchemaPolling
