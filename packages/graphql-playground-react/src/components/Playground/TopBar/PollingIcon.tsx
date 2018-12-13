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
      <Positioner onClick={props.onTogglePollingSchema} title="Poll Schema">
        <Svg isPollingSchema={props.isPollingSchema} viewBox="0 0 25 25">
          <Icon
            isPollingSchema={props.isPollingSchema}
            fill="none"
            d="M0 0h24v24H0V0z"
          />
          <Icon
            isPollingSchema={props.isPollingSchema}
            d="M 16.505 5.43 C 16.647 5.263 16.818 5.116 17.016 4.999 C 17.974 4.436 19.197 4.769 19.755 5.75 C 20.305 6.731 19.98 7.981 19.017 8.551 C 18.838 8.656 18.65 8.729 18.458 8.774 L 18.458 14.223 C 18.652 14.268 18.843 14.342 19.025 14.449 C 19.99 15.019 20.315 16.269 19.76 17.25 L 19.757 17.25 C 19.207 18.231 17.982 18.566 17.021 18.001 C 16.855 17.904 16.708 17.786 16.582 17.653 L 12.018 20.738 C 12.025 20.808 12.029 20.879 12.029 20.95 C 12.029 22.075 11.136 23 10.028 23 C 8.92 23 8.027 22.08 8.027 20.95 C 8.027 20.825 8.038 20.703 8.058 20.584 L 3.566 17.546 C 3.42 17.723 3.242 17.878 3.034 18.001 C 2.071 18.564 0.848 18.231 0.296 17.25 L 0.298 17.25 C -0.252 16.269 0.073 15.019 1.031 14.449 C 1.205 14.347 1.388 14.274 1.574 14.23 L 1.574 8.778 C 1.377 8.734 1.184 8.659 1 8.551 C 0.042 7.989 -0.283 6.731 0.267 5.75 C 0.818 4.769 2.043 4.434 3.004 4.999 C 3.247 5.144 3.45 5.332 3.608 5.549 L 8.144 2.737 C 8.068 2.521 8.027 2.287 8.027 2.044 C 8.027 0.915 8.922 0 10.028 0 C 11.133 0 12.029 0.915 12.029 2.044 C 12.029 2.24 12.002 2.428 11.952 2.607 Z M 10.028 18.901 C 10.736 18.901 11.357 19.275 11.712 19.842 L 15.915 17 L 4.391 17 L 8.422 19.726 C 8.786 19.225 9.369 18.901 10.028 18.901 Z M 16.286 15.2 C 16.397 15.002 16.536 14.83 16.695 14.687 L 10.537 4.022 C 10.375 4.066 10.204 4.089 10.028 4.089 C 9.888 4.089 9.752 4.074 9.62 4.046 L 3.435 14.76 C 3.562 14.888 3.676 15.035 3.77 15.2 C 3.912 15.454 3.996 15.726 4.025 16 L 16.03 16 C 16.06 15.726 16.143 15.454 16.286 15.2 Z M 8.647 3.525 L 3.976 6.421 C 4.055 6.878 3.983 7.365 3.739 7.8 C 3.466 8.287 3.024 8.615 2.532 8.752 L 2.532 14.241 C 2.559 14.248 2.587 14.256 2.615 14.265 L 8.758 3.625 C 8.72 3.593 8.683 3.559 8.647 3.525 Z M 17.5 8.756 C 17.001 8.621 16.553 8.292 16.276 7.8 L 16.281 7.8 C 16.009 7.315 15.951 6.765 16.077 6.264 L 11.502 3.428 C 11.461 3.472 11.419 3.516 11.375 3.557 L 17.5 14.166 Z"
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
  width: 25px;
  height: 25px;
  cursor: pointer;
  transform: rotateY(180deg);
`

const Svg = styled.svg`
  fill: ${p =>
    p.isPollingSchema ? p.theme.colours.green : p.theme.editorColours.icon};
  transition: 0.1s linear all;

  &:hover {
    fill: ${p =>
      p.isPollingSchema
        ? p.theme.colours.green
        : p.theme.editorColours.iconHover};
  }
`

const Icon = styled<Props, 'path'>('path')`
  transition: opacity 0.3s ease-in-out;
  transform-origin: 9.5px 10px;
`
