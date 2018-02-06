import * as React from 'react'
import { keyframes, styled } from '../styled'

const Spinner = () => (
  <Wrapper>
    <SpinnerNode />
  </Wrapper>
)

const rotation = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(359deg);
  }
`

const Wrapper = styled.div`
  height: 36px;
  left: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 36px;
  z-index: 10;
`

const SpinnerNode = styled.div`
  position: absolute;
  display: inline-block;
  height: 24px;
  width: 24px;
  vertical-align: middle;

  animation: ${rotation} 0.6s infinite linear;

  border-radius: 100%;
  border-bottom: 6px solid rgba(150, 150, 150, 0.15);
  border-left: 6px solid rgba(150, 150, 150, 0.15);
  border-right: 6px solid rgba(150, 150, 150, 0.15);
  border-top: 6px solid rgba(150, 150, 150, 0.8);
`

export default Spinner
