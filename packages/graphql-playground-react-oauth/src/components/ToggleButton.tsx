import * as React from 'react'
import { styled } from '../styled'

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

const Wrapper = styled.div`
  position: relative;
  display: inline-block;

  width: 39px;
  height: 21px;
`

const Input = styled.input`
  display: none;
`

interface SliderProps {
  checked: boolean
}

const Slider = styled<SliderProps, 'div'>('div')`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  transition: transform 70ms linear;
  border-radius: 23px;
  cursor: pointer;

  background: ${p =>
    p.checked ? p.theme.colours.green : p.theme.colours.black40};

  &:before {
    position: absolute;
    content: '';
    height: 23px;
    width: 23px;
    left: -1px;
    bottom: -1px;
    background-color: white;
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
    transition: transform 70ms linear;

    transform: ${p => (p.checked ? 'translateX(19px)' : '')};
  }
`
