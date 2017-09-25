import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as cx from 'classnames'
import shouldUpdate from './Playground/util/shouldUpdate'

export interface Props {
  open: boolean
  children: any
  anchorOrigin?: {
    vertical?: 'bottom' | 'top'
    horizontal?: 'left' | 'right' | 'center'
  }
  onClick?: () => void
  onClose?: (e?: any) => void
}

class Tooltip extends React.PureComponent<Props, {}> {
  static defaultProps: Partial<Props> = {
    anchorOrigin: {
      vertical: 'top',
      horizontal: 'center',
    },
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shouldUpdate(null, this, nextProps, nextState)
  }

  componentDidMount() {
    document.addEventListener('click', this.handleClickOutside.bind(this), true)
  }

  componentWillUnmount() {
    document.removeEventListener(
      'click',
      this.handleClickOutside.bind(this),
      true,
    )
  }

  handleClickOutside = event => {
    if (!this.props.open) {
      return
    }

    const domNode = ReactDOM.findDOMNode(this)

    if (
      (!domNode || !domNode.contains(event.target)) &&
      typeof this.props.onClose !== 'undefined'
    ) {
      event.stopPropagation()
      this.props.onClose(event)
    }
  }

  render() {
    const { open, children, onClick } = this.props
    const anchorOrigin = this.props.anchorOrigin!
    return (
      <div
        className={cx('tooltip-container', {
          visible: open,
          'anchor-top': anchorOrigin.vertical === 'top',
          'anchor-bottom': anchorOrigin.vertical === 'bottom',
          'anchor-left': anchorOrigin.horizontal === 'left',
          'anchor-right': anchorOrigin.horizontal === 'right',
          'anchor-center': anchorOrigin.horizontal === 'center',
        })}
      >
        <style jsx={true}>{`
          .tooltip-container {
            @p: .absolute, .tl;
            transform: translateX(-50%);
            z-index: 9999;
            transition: opacity ease-out 0.2s;
            visibility: hidden;
            opacity: 0;
          }
          .tooltip-container.anchor-top {
            @p: .bottom100;
            margin-bottom: 16px;
            & .big-triangle {
              bottom: -10px;
            }
          }
          .tooltip-container.anchor-bottom {
            @p: .top100;
            margin-top: 16px;
            & .big-triangle {
              top: -10px;
              border-width: 0 10px 10px 10px;
              border-color: #f3f4f4 transparent #f3f4f4 transparent;
            }
          }
          .tooltip-container.anchor-left {
            @p: .left50;
            left: 0;
            transform: none;
            & .big-triangle {
              left: 25px;
            }
          }
          .tooltip-container.anchor-right {
            @p: .right50;
            right: 0;
            transform: none;
            & .big-triangle {
              right: 25px;
            }
          }
          .tooltip-container.anchor-center {
            @p: .left50;

            & .big-triangle {
              left: calc(50% - 10px);
            }
          }
          .tooltip-container.visible {
            visibility: visible;
            opacity: 1;
          }
          .tooltip-container .tooltip-content {
            @p: .nowrap, .br2, .black50, .ph16, .pv12, .flex, .itemsCenter;
            background-color: #f3f4f4;
            box-shadow: 0 1px 6px 0 rgba(0, 0, 0, 0.15);
          }
          .big-triangle {
            @p: .absolute;
            width: 0;
            height: 0;
            border-style: solid;
            border-width: 10px 10px 0 10px;
            border-color: #f3f4f4 transparent transparent transparent;
          }
        `}</style>
        <div className="tooltip-content" onClick={onClick}>
          <div className="big-triangle" />
          {children}
        </div>
      </div>
    )
  }
}

export default Tooltip
