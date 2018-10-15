import * as React from 'react'
import { styled } from '../styled'
import { FullArrowRightIcon } from './Icons'

export interface Props {
  purple?: boolean
  hideArrow?: boolean
  children?: any
  onClick?: (e?: any) => void
}

export const Button = ({ purple, hideArrow, children, onClick }: Props) => (
  <ButtonBox purple={purple} onClick={onClick}>
    {children ? children : 'Learn more'}
    {!hideArrow && <FullArrowRightIcon color={'red'} width={14} height={11} />}
  </ButtonBox>
)

interface ButtonProps {
  purple?: boolean
}

export const ButtonBox = styled<ButtonProps, 'div'>('div')`
  display: flex;
  align-items: center;

  padding: 6px 16px;
  border-radius: 2px;
  background: ${p => (p.purple ? 'rgb(218, 27, 127)' : '#2a7ed2')};
  color: ${p => p.theme.colours.white};
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2);
  text-transform: uppercase;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 1px;
  white-space: nowrap;

  transition: background 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
  cursor: pointer;
  &:hover {
    background: ${p => (p.purple ? 'rgb(164, 3, 111)' : '#3f8ad7')};
    transform: ${p =>
      p.purple ? 'translate3D(0, 0, 0)' : 'translate3D(0, -1px, 0)'};
    svg {
      animation: move 1s ease infinite;
    }
  }

  svg {
    margin-left: 10px;
    fill: ${p => p.theme.colours.white};
  }

  @keyframes move {
    0% {
      transform: translate3D(0, 0, 0);
    }

    50% {
      transform: translate3D(3px, 0, 0);
    }

    100% {
      transform: translate3D(0, 0, 0);
    }
  }
`
