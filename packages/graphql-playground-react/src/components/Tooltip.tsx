import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { css, styled } from '../styled'

export interface Props {
  open: boolean
  children: any
  anchorOrigin?: {
    vertical?: 'bottom' | 'top'
    horizontal?: 'left' | 'right' | 'center'
  }
  renderAfterContent?: () => any
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

  componentDidMount() {
    document.addEventListener('click', this.handleClickOutside, true)
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

    try {
      const domNode = ReactDOM.findDOMNode(this as any)

      if (
        (!domNode || !domNode.contains(event.target)) &&
        typeof this.props.onClose !== 'undefined'
      ) {
        this.props.onClose(event)
      }
    } catch (e) {
      //
    }
  }

  render() {
    const { open, children, renderAfterContent, onClick } = this.props
    const anchorOrigin = this.props.anchorOrigin!
    return (
      <Wrapper
        visible={open}
        anchorTop={anchorOrigin.vertical === 'top'}
        anchorBottom={anchorOrigin.vertical === 'bottom'}
        anchorLeft={anchorOrigin.horizontal === 'left'}
        anchorRight={anchorOrigin.horizontal === 'right'}
        anchorCenter={anchorOrigin.horizontal === 'center'}
      >
        <Content onClick={onClick}>
          <BigTriangle />
          {children}
        </Content>

        {renderAfterContent && renderAfterContent()}
      </Wrapper>
    )
  }
}

export default Tooltip

interface WrapperProps {
  visible?: boolean
  anchorTop?: boolean
  anchorBottom?: boolean
  anchorLeft?: boolean
  anchorRight?: boolean
  anchorCenter?: boolean
}

const Wrapper = styled.div`
  position: absolute;
  z-index: 9999;

  text-align: left;
  transform: translateX(-50%);

  transition: opacity ease-out 0.2s;

  ${(p: WrapperProps) =>
    p.visible
      ? css`
          visibility: visible;
          opacity: 1;
        `
      : css`
          visibility: hidden;
          opacity: 0;
        `} ${(p: WrapperProps) =>
  p.anchorTop
    ? css`
        bottom: 100%;
        margin-bottom: 16px;

        ${BigTriangle} {
          bottom: -10px;
        }
      `
    : ''} ${(p: WrapperProps) =>
  p.anchorBottom
    ? css`
        top: 100%;
        margin-top: 16px;

        ${BigTriangle} {
          top: -10px;
          border-width: 0 10px 10px 10px;
          border-color: ${k => k.theme.colours.paleGrey} transparent
            ${k => k.theme.colours.paleGrey} transparent;
        }
      `
    : ''} ${(p: WrapperProps) =>
  p.anchorLeft
    ? css`
        left: 0;
        transform: none;

        ${BigTriangle} {
          left: 25px;
        }
      `
    : ''} ${(p: WrapperProps) =>
  p.anchorRight
    ? css`
        right: 0;
        transform: none;

        ${BigTriangle} {
          right: 25px;
        }
      `
    : ''} ${(p: WrapperProps) =>
  p.anchorCenter
    ? css`
        left: 50%;

        ${BigTriangle} {
          left: calc(50% - 10px);
        }
      `
    : ''};
`

const Content = styled.div`
  display: flex;
  align-items: center;

  padding: ${p => p.theme.sizes.small12} ${p => p.theme.sizes.small16};
  white-space: nowrap;

  box-shadow: 0 1px 6px 0 rgba(0, 0, 0, 0.15);
  background-color: ${p => p.theme.colours.paleGrey};
  border-radius: ${p => p.theme.sizes.smallRadius};
  color: ${p => p.theme.colours.paleText};
`

const BigTriangle = styled.div`
  position: absolute;
  width: 0;
  height: 0;

  border-style: solid;
  border-width: 10px 10px 0 10px;
  border-color: ${p => p.theme.colours.paleGrey} transparent transparent
    transparent;
`
