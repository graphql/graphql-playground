import * as React from 'react'
import { styled } from '../../../styled'

const Title = styled.div`
  color: rgba(0, 0, 0, 0.3);
  cursor: default;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase !important;
  letter-spacing: 1px;
  padding: 16px;
  user-select: none;
`
export const CategoryTitle = ({ children }) => <Title>{children}</Title>
