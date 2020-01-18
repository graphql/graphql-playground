import * as React from 'react'
import { styled, keyframes, css } from '../../../styled/index'
import BasePositioner from './Positioner'

export interface Props {
  animate: boolean
  disabled?: boolean
  onClick?: () => void
}

const ReloadIcon: React.SFC<Props> = props => (
  <Positioner
    onClick={props.onClick}
    title="Reload Schema"
    disabled={props.disabled}
  >
    <Svg viewBox="0 0 20 20" disabled={props.disabled}>
      <Circle
        cx="9.5"
        cy="10"
        r="6"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        animate={props.animate}
      />
      <Icon
        d="M4.83 4.86a6.92 6.92 0 0 1 11.3 2.97l.41-1.23c.13-.4.56-.6.95-.47.4.13.6.56.47.95l-1.13 3.33a.76.76 0 0 1-.7.5.72.72 0 0 1-.43-.12l-2.88-1.92a.76.76 0 0 1-.2-1.04.75.75 0 0 1 1.03-.2l1.06.7A5.34 5.34 0 0 0 9.75 4.5a5.44 5.44 0 0 0-5.64 5.22 5.42 5.42 0 0 0 5.24 5.62c.41 0 .74.36.72.78a.75.75 0 0 1-.75.72H9.3a6.9 6.9 0 0 1-6.68-7.18 6.88 6.88 0 0 1 2.22-4.81z"
        animate={props.animate}
      />
    </Svg>
  </Positioner>
)

export default ReloadIcon

const refreshFrames = keyframes`
0% {
  transform: rotate(0deg);
  stroke-dashoffset: 7.92;
}

50% {
  transform: rotate(720deg);
  stroke-dashoffset: 37.68;
}

100% {
  transform: rotate(1080deg);
  stroke-dashoffset: 7.92;
}
`

// same result for these 2 keyframes, however when the props change
// it makes the element animated with these keyframes to trigger
// again the animation
const reloadAction = props => keyframes`
0% {
  transform: rotate(${props.animate ? 0 : 360}deg);
}

100% {
  transform: rotate(${props.animate ? 360 : 720}deg);
}`

const Svg = styled.svg`
  fill: ${p => p.theme.editorColours.icon};
  transition: 0.1s linear all;
  ${p =>
    p.disabled
      ? undefined
      : css`
          &:hover {
            fill: ${p => p.theme.editorColours.iconHover};
          }
        `};
`
const Positioner = styled(BasePositioner)`
  cursor: ${({ disabled = false }) => (disabled ? 'auto' : 'pointer')};
  transform: rotateY(180deg);
`
const Circle = styled<Props, 'circle'>('circle')`
  fill: none;
  stroke: ${p => p.theme.editorColours.icon};
  stroke-dasharray: 37.68;
  transition: opacity 0.3s ease-in-out;
  opacity: ${p => (p.animate ? 1 : 0)};
  transform-origin: 9.5px 10px;
  animation: ${refreshFrames} 2s linear ${p => (p.animate ? 'infinite' : '')};
`

const Icon = styled<Props, 'path'>('path')`
  transition: opacity 0.3s ease-in-out;
  opacity: ${p => (p.animate ? 0 : 1)};
  transform-origin: 9.5px 10px;
  animation: ${reloadAction} 0.5s linear;
`
