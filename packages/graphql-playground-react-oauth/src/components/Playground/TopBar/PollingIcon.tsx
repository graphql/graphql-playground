import * as React from 'react'
import { styled, keyframes, css } from '../../../styled/index'
import BasePositioner from './Positioner'

export interface Props {
  animate: boolean
  disabled?: boolean
  onClick?: () => void
}

const PollingIcon: React.SFC<Props> = props => (
  <Positioner onClick={props.onClick} title="Polling Schema">
    <Icon animate={props.animate} />
  </Positioner>
)

export default PollingIcon

const pulse = keyframes`
0% {
  box-shadow: 0 0 0 0 rgba(139, 149, 156, 0.4);
}
70% {
  box-shadow: 0 0 0 10px rgba(139, 149, 156, 0);
}
100% {
  box-shadow: 0 0 0 0 rgba(139, 149, 156, 0);
}
`

const Positioner = styled(BasePositioner)`
  display: flex;
  justify-content: center;
  align-items: center;
`
const Icon = styled.div`
  display: block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${p => p.theme.editorColours.pollingIcon};
  box-shadow: 0 0 0 ${p => p.theme.editorColours.pollingIconShadow};
  ${p =>
    p.animate
      ? css`
          animation: ${pulse} 2s infinite;
        `
      : undefined};
`
