import * as React from 'react'
import { styled } from '../styled'

export default function Loading() {
  return (
    <Wrapper>
      <Image src="/logo.png" alt="logo" />
      <Text>
        Loading <Title>GraphQL Playground</Title>
      </Text>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`

const Text = styled.div`
  font-size: 32px;
  font-weight: 200;
  color: rgba(255, 255, 255, 0.6);
  margin-left: 20px;
`

const Image = styled.div`
  width: 78px;
  height: 78px;
`

const Title = styled.span`
  font-weight: 400;
`
