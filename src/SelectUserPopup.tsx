import * as React from 'react'
// import * as fetch from 'isomorphic-fetch'
import {modalStyle} from './constants'
import * as Modal from 'react-modal'
import {Icon, $v} from 'graphcool-styles'
import Table from './SelectUserPopup/Table'

interface State {
  startIndex: number
  stopIndex: number
}

interface Props {
  projectId: string
  adminAuthToken: string
  userFields: string[]
  onSelectUser: Function
  isOpen: boolean
  onRequestClose: Function
}

const fields = ['id', 'name', 'createdAt']
const users = [
  {
    id: 'asldka',
    name: 'Hans',
    createdAt: new Date(),
  },
  {
    id: 'aslasdiahsda',
    name: 'Peter',
    createdAt: new Date(),
  },
  {
    id: 'asasd90asjda',
    name: 'Schmidt',
    createdAt: new Date(),
  },
  {
    id: 'asaaaaaaaaaaa',
    name: 'Whooooot',
    createdAt: new Date(),
  },
]

export default class SelectUserPopup extends React.Component<Props, State> {

  private style: any
  constructor(props) {
    super(props)

    this.state = {
      startIndex: 0,
      stopIndex: 50,
    }

    this.getUsers({startIndex: 0, stopIndex: 50})

    this.style = Object.assign({}, modalStyle, {
      overlay: modalStyle.overlay,
      content: Object.assign({}, modalStyle.content, {
        width: 'auto',
        minWidth: '600px',
        maxWidth: window.innerWidth - 100 + 'px',
      })
    })
  }

  componentWillReceiveProps(nextProps) {
    const {startIndex, stopIndex} = this.state

    if (nextProps.userFields !== this.props.userFields) {
      this.getUsers({startIndex, stopIndex})
    }
  }

  render() {
    return (
      <Modal
        isOpen={this.props.isOpen}
        onRequestClose={this.props.onRequestClose}
        contentLabel='Select a User'
        style={this.style}
      >
      <style jsx>{`
        .select-user-popup {
          @inherit: .bgWhite, .relative;
        }
        .title-wrapper {
          @inherit: .flex, .w100, .itemsCenter, .justifyCenter, .bb, .bBlack10;
          padding: 45px;
        }
        .title {
          @inherit: .fw3, .f38;
          letter-spacing: 0.54px;
        }
      `}</style>
        <style jsx global>{`
          .popup-x {
            @inherit: .absolute, .right0, .top0, .pointer, .pt25, .pr25;
          }
        `}</style>
        <div className="select-user-popup">
          <div className="title-wrapper">
            <div className='title'>
              Select a User's view
            </div>
          </div>
          <Icon
            src={require('graphcool-styles/icons/stroke/cross.svg')}
            stroke={true}
            width={25}
            height={25}
            strokeWidth={2}
            className='popup-x'
            color={$v.gray50}
            onClick={this.props.onRequestClose}
          />
          <Table
            fields={fields}
            rows={users}
            rowCount={users.length}
            loadMoreRows={this.getUsers}
          />
        </div>
      </Modal>
    )
  }

  getUsers({startIndex, stopIndex}: {startIndex: number, stopIndex: number}) {
    if (this.props.userFields.length === 0) {
      return
    }
    console.log(startIndex, stopIndex, this.props.userFields, this.props.adminAuthToken)

    // return fetch()
  }
}