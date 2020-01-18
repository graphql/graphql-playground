import * as React from 'react'
import { css, styled } from '../styled'

export interface ToggleProps {
  choices: string[]
  onChange: (choice: string, i: number) => void
  activeChoice: string
}

const Toggle: React.SFC<ToggleProps> = ({
  choices,
  onChange,
  activeChoice,
}) => (
  <Wrapper>
    {choices.map((choice, i) => (
      <Choice
        active={choice === activeChoice}
        key={choice}
        // tslint:disable-next-line
        onClick={() => onChange(choice, i)}
      >
        {choice}
      </Choice>
    ))}
  </Wrapper>
)

const Wrapper = styled.div`
  display: flex;
`

interface ChoiceProps {
  active: boolean
}

// prettier-ignore
const Choice = styled.div`
  padding: 4px 8px;
  margin-right: ${p => p.theme.sizes.small6};

  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.2px;

  cursor: pointer;
  border-radius: ${p => p.theme.sizes.smallRadius};
  color: ${p => p.theme.colours.black40};

  ${(p: ChoiceProps) => p.active ? css`
    color: rgba(0, 0, 0, 0.7);
    background: #b8bfc4;
  ` : css`
    /* hover state when it's not active */
    &:hover {
      color: rgba(0, 0, 0, 0.7);
    }
  `}
`

export default Toggle
