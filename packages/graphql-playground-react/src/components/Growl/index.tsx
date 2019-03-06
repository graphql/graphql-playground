import * as React from 'react'
import { styled } from '../../styled'

const Growl = () => <Wrapper>This is growl component</Wrapper>

const Wrapper = styled.div`
  background-color: #c73232;
  padding: 15px;
  width: 100%;
  z-index: 1;
`

export default Growl
