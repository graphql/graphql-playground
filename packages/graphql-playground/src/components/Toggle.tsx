import * as React from 'react'
import * as cn from 'classnames'

interface ToggleProps {
  choices: string[]
  onChange: (choice: string, i: number) => void
  activeChoice: string
}

export default function Toggle({
  choices,
  onChange,
  activeChoice,
}: ToggleProps) {
  return (
    <div className="toggle">
      <style jsx={true}>{`
        .toggle {
          @p: .flex;
        }
        .choice {
          @p: .f12, .ttu, .br2, .mr6, .fw6, .black40, .pointer;
          letter-spacing: 0.2px;
          padding: 4px 8px;
        }
        .choice.active {
          @p: .black70;
          background: #b8bfc4;
        }
        .choice:not(.active):hover {
          @p: .black70;
        }
      `}</style>
      {choices.map((choice, i) =>
        <div
          className={cn('choice', { active: choice === activeChoice })}
          key={choice}
          // tslint:disable-next-line
          onClick={() => onChange(choice, i)}
        >
          {choice}
        </div>,
      )}
    </div>
  )
}
