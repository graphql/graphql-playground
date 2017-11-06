/* tslint:disable */
import * as React from 'react'
import * as cx from 'classnames'
import { $p } from 'graphcool-styles'
import styled, { css } from 'styled-components'

export interface Props {
  checked: boolean
  onChange: (e: any) => void
  className?: string
}

const ToggleButton = ({ checked, onChange, className }: Props) => {
  return (
    <Wrapper className={className} onClick={onChange}>
      <Input type="checkbox" checked={checked} readOnly={true} />
      <Slider checked={checked} />
    </Wrapper>
  )
}

export default ToggleButton

const Wrapper = styled.div.attrs({
  // Here we're extending the particles and the passed down className
  // from the own props
  className: p => cx($p.relative, $p.dib, p.className),
})`
  /* Other custom styles */
  width: 39px;
  height: 21px;
`

const Input = styled.input`display: none;`

interface SliderProps {
  checked: boolean
  className?: string
}

const Slider = styled.div.attrs({
  className: (p: SliderProps) =>
    cx(
      $p.absolute,
      $p.pointer,
      $p.top0,
      $p.left0,
      $p.right0,
      $p.bottom0,
      // Change color if it's checked
      p.checked ? $p.bgGreen : $p.bgBlack40,
    ),
})`
  transition: transform 70ms linear;
  border-radius: 23px;

  &:before {
    position: absolute;
    content: "";
    height: 23px;
    width: 23px;
    left: -1px;
    bottom: -1px;
    background-color: white;
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0, 0, 0, .25);
    transition: transform 70ms linear;

    ${(p: SliderProps) =>
      p.checked
        ? css`
      transform: translateX(19px);
    `
        : ''}
  }
`
