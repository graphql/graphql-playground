import * as React from 'react'
import { styled } from '../../../styled/index'

export interface Props {
  isPollingSchema: boolean
  onReloadSchema: () => void
  onTogglePollingSchema: () => void
}

class PollingIcon extends React.Component<Props> {
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
    const props = this.props
    return (
      <Positioner onClick={props.onTogglePollingSchema} title="Reload Schema">
        <Svg isPollingSchema={props.isPollingSchema} viewBox="0 0 20 25">
          <Icon
            isPollingSchema={props.isPollingSchema}
            fill="none"
            d="M0 0h24v24H0V0z"
          />
          <Icon
            isPollingSchema={props.isPollingSchema}
            d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"
          />
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

export default PollingIcon

const Positioner = styled.div`
  width: 20px;
  height: 20px;
  cursor: pointer;
  transform: rotateY(180deg);
`

const Svg = styled.svg`
  fill: ${p =>
    p.isPollingSchema ? p.theme.colours.green : p.theme.editorColours.icon};
  transition: 0.1s linear all;

  &:hover {
    fill: ${p => p.theme.editorColours.iconHover};
  }
`

const Icon = styled<Props, 'path'>('path')`
  transition: opacity 0.3s ease-in-out;
  transform-origin: 9.5px 10px;
`
