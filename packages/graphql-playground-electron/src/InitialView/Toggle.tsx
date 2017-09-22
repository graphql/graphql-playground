import * as React from 'react'
import * as cn from 'classnames'

export interface ToggleProps {
  choices: string[]
  onChange: (choice: string, i: number) => void
  activeChoice: string
}

/* tslint:disable */
const Toggle = ({ choices, onChange, activeChoice }: ToggleProps) => {
  return (
    <div className="toggle">
      <style jsx={true}>{`
        .toggle {
          @p: .flex;
        }
        .choice {
          @p: .f14, .ttu, .br2, .mr6, .fw6, .darkBlue40, .pointer;
          letter-spacing: 0.53px;
          padding: 5px 9px;
        }
        .choice.active {
          @p: .darkBlue50, .bgDarkBlue10;
        }
        .choice:not(.active):hover {
          @p: .darkBlue50;
        }
      `}</style>
      {choices.map((choice, i) =>
        <div
          className={cn('choice', { active: choice === activeChoice })}
          key={choice}
          onClick={() => onChange(choice, i)}
        >
          {choice}
        </div>,
      )}
    </div>
  )
}

export default Toggle
