import * as React from 'react'
import * as Modal from 'react-modal'
import { styled } from '../styled'

export interface Props {
  onRequestClose: () => void
  width?: number
  closeInside?: boolean
  darkBg?: boolean
}

export const fieldModalStyle = {
  overlay: {
    zIndex: 100,
    backgroundColor: 'rgba(255,255,255,.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    position: 'relative',
    width: 554,
    height: 'auto',
    top: 'initial',
    left: 'initial',
    right: 'initial',
    bottom: 'initial',
    borderRadius: 2,
    padding: 0,
    border: 'none',
    background: 'none',
    // boxShadow: '0 1px 7px rgba(0,0,0,.2)',
    overflow: 'visible',
  },
}

export default class Popup extends React.Component<Props, {}> {
  render() {
    const { darkBg } = this.props
    const modalStyle = {
      overlay: {
        ...fieldModalStyle.overlay,
        background: darkBg ? 'rgba(23,42,58,1.0)' : 'rgba(255,255,255,.9)',
      },
      content: {
        ...fieldModalStyle.content,
        width: this.props.width || 560,
      },
    }
    return (
      <Modal
        isOpen={true}
        onRequestClose={this.props.onRequestClose}
        style={modalStyle}
        ariaHideApp={false}
        contentLabel="Popup"
      >
        <ContentWrapper>{this.props.children}</ContentWrapper>
      </Modal>
    )
  }
}

const ContentWrapper = styled.div``
