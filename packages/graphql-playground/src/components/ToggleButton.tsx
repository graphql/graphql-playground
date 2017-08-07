import * as React from 'react'
import * as cx from 'classnames'

interface Props {
  checked: boolean
  onChange: (e: any) => void
  className?: string
}

const ToggleButton = ({ checked, onChange, className }: Props) => {
  return (
    <div className={cx('toggle-button', className)}>
      <style jsx={true}>{`
        .toggle-button {
          @p: .relative, .dib;
          width: 39px;
          height: 21px;
        }
        .toggle-slider {
          @p: .absolute, .pointer, .top0, .left0, .right0, .bottom0, .bgBlack40;
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
          }
        }
        .toggle-input {
          display: none;
          &:checked + div {
            @p: .bgGreen;
          }
          &:checked + div:before {
            transform: translateX(19px);
          }
        }
      `}</style>
      <input
        className="toggle-input"
        type="checkbox"
        checked={checked}
        onChange={onChange}
      />
      <div className="toggle-slider" />
    </div>
  )
}

export default ToggleButton
