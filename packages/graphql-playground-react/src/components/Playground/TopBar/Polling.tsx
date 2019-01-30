import * as React from 'react'
import PollingIcon from './PollingIcon'

export interface Props {
  interval: number
  isReloadingSchema: boolean
  onReloadSchema: () => void
}

interface State {
  windowVisible: boolean
}

class SchemaPolling extends React.Component<Props, State> {
  timer: any
  constructor(props) {
    super(props)

    this.state = {
      windowVisible: true,
    }
  }
  componentDidMount() {
    this.startPolling()
    document.addEventListener('visibilitychange', this.setWindowVisibility)
  }
  componentWillUnmount() {
    this.clearTimer()
    document.removeEventListener('visibilitychange', this.setWindowVisibility)
  }
  setWindowVisibility = () => {
    if (document.visibilityState === 'visible') {
      this.setState(
        {
          windowVisible: true,
        },
        this.startPolling,
      )
    }
    if (document.visibilityState === 'hidden') {
      this.setState(
        {
          windowVisible: false,
        },
        this.startPolling,
      )
    }
  }
  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.isReloadingSchema !== this.props.isReloadingSchema) {
      this.startPolling(nextProps)
    }
  }

  render() {
    return <PollingIcon animate={this.state.windowVisible} />
  }
  private startPolling = (props: Props = this.props) => {
    this.clearTimer()
    if (!props.isReloadingSchema && this.state.windowVisible) {
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
