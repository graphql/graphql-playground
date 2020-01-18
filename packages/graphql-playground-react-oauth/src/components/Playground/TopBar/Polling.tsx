import * as React from 'react'
import PollingIcon from './PollingIcon'

export interface Props {
  interval: number
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
    this.updatePolling()
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
        this.updatePolling,
      )
    }
    if (document.visibilityState === 'hidden') {
      this.setState(
        {
          windowVisible: false,
        },
        this.updatePolling,
      )
    }
  }
  componentWillReceiveProps(nextProps: Props) {
    this.updatePolling(nextProps)
  }

  render() {
    return <PollingIcon animate={this.state.windowVisible} />
  }
  private updatePolling = (props: Props = this.props) => {
    this.clearTimer()
    if (this.state.windowVisible) {
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
