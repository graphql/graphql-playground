import * as React from 'react'
import * as Modal from 'react-modal'
import { modalStyle } from '../constants'

export interface Props {
  isOpen: boolean
  contentLabel: string
  onRequestClose: () => void
  children: JSX.Element
}

const ModalComponent = ({
  isOpen,
  onRequestClose,
  contentLabel,
  children,
}: Props) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel={contentLabel}
      style={modalStyle}
    >
      {children}
    </Modal>
  )
}

export default ModalComponent
