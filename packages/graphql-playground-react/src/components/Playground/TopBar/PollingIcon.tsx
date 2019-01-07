import * as React from 'react'
import { styled, keyframes } from '../../../styled/index'

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
    return (
      <Positioner title="Polling Schema">
        <Svg viewBox="0 0 20 20">
          <Icon d="M4.83 4.86a6.92 6.92 0 0 1 11.3 2.97l.41-1.23c.13-.4.56-.6.95-.47.4.13.6.56.47.95l-1.13 3.33a.76.76 0 0 1-.7.5.72.72 0 0 1-.43-.12l-2.88-1.92a.76.76 0 0 1-.2-1.04.75.75 0 0 1 1.03-.2l1.06.7A5.34 5.34 0 0 0 9.75 4.5a5.44 5.44 0 0 0-5.64 5.22 5.42 5.42 0 0 0 5.24 5.62c.41 0 .74.36.72.78a.75.75 0 0 1-.75.72H9.3a6.9 6.9 0 0 1-6.68-7.18 6.88 6.88 0 0 1 2.22-4.81z" />
        </Svg>
      </Positioner>
    )
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

const pulseAction = props => keyframes`
  from { transform: scale(1); }
  50% { transform: scale(0.90); }
  to { transform: scale(1); }
`

const Positioner = styled.div`
  width: 25px;
  height: 25px;
  /* cursor: pointer; */
  transform: rotateY(180deg);
`

const Svg = styled.svg`
  fill: ${p => p.theme.colours.green};
  transition: 0.1s linear all;

  &:hover {
    fill: ${p => p.theme.colours.green};
  }
`

const Icon = styled<Props, 'path'>('path')`
  transition: opacity 0.3s ease-in-out;
  opacity: ${p => (p.isReloadingSchema ? 0 : 1)};
  transform-origin: 9.5px 10px;
  animation: ${pulseAction} 3s linear infinite;
`
