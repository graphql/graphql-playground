import * as React from 'react'
import PollingIcon from './PollingIcon'

export interface Props {
  isPollingSchema: boolean
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
    if (nextProps.isPollingSchema !== this.props.isPollingSchema) {
      this.startPolling(nextProps)
    }
  }

  render() {
    return <PollingIcon animate={true} />
  }
  private startPolling(props: Props = this.props) {
    this.clearTimer()
    if (props.isPollingSchema) {
      this.timer = setInterval(() => props.onReloadSchema(), 2000)
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
