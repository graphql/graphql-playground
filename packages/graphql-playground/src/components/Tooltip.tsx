import * as React from 'react'
import * as cx from 'classnames'

interface Props {
  className?: string
  position?: 'top' | 'right' | 'bottom' | 'left'
  visible: boolean
  children: any
}

const Tooltip = ({
  visible,
  position = 'bottom',
  children,
  className,
}: Props) => {
  return (
    <div className={cx('tooltip-wrapper', className)}>
      <style jsx={true}>{`
        .tooltip-wrapper {
          @p: .relative, .dib;
        }
        .tooltip {
          @p: .absolute, .z999;
          transition: opacity ease-in-out 0.1s;
          bottom: 100%;
          left: 50%;
          margin-bottom: 10px;
          padding: 5px;
          transform: translateX(-50%);
        }
        .content {
          @p: .relative, .bgWhite, .pa20, .ba, .bw2, .br2, .bBlack10;
        }
        .big-triangle {
          @p: .absolute;
          top: -16px;
          left: calc(50% - 13px);
          width: 0;
          height: 0;
          border-style: solid;
          border-width: 0 13px 16px 13px;
          border-color: transparent transparent #e5e5e5 transparent;
        }
        .small-triangle {
          @p: .absolute;
          top: -13px;
          left: calc(50% - 10px);
          width: 0;
          height: 0;
          border-style: solid;
          border-width: 0 10px 12.5px 10px;
          border-color: transparent transparent #ffffff transparent;
        }

        /* .tooltip-wrapper {
          @p: .relative;
        }
        .tooltip {
          @p: .absolute, .z999;
          transition: opacity ease-in-out 0.1s;
          right: 0;
        }
        .big-triangle {
          @p: .absolute;
          top: -16px;
          left: calc(50% - 13px);
          width: 0;
          height: 0;
          border-style: solid;
          border-width: 0 13px 16px 13px;
          border-color: transparent transparent #E5E5E5 transparent;
        }
        .small-triangle {
          @p: .absolute;
          top: -13px;
          left: calc(50% - 10px);
          width: 0;
          height: 0;
          border-style: solid;
          border-width: 0 10px 12.5px 10px;
          border-color: transparent transparent #ffffff transparent;
        }
        .content {
          @p: .relative, .bgWhite, .pa20, .ba, .bw2, .br2, .bBlack10;
        } */
      `}</style>

      <div className="tooltip">
        <div className="content">
          <div className="big-triangle" />
          <div className="small-triangle" />
          {children}
        </div>
      </div>
    </div>
  )
}

export default Tooltip

/* <div
            className="change-theme"
            onClick={() => onChangeTheme(theme === 'black' ? 'light' : 'black')}
            title="switch theme"
          >
            hey tooltip
            <Tooltip visible={true}>
              <span>LIGHT MODE</span>
              <ToggleButton
                checked={theme === 'light'}
                onChange={onChangeTheme}
              />
            </Tooltip>
          </div> */
