import * as React from 'react'
import * as fetch from 'isomorphic-fetch'
import { modalStyle } from '../constants'
import * as Modal from 'react-modal'
import { Icon, $v } from 'graphcool-styles'
import Table from './SelectUserPopup/Table'
import SearchBox from './Playground/DocExplorer/SearchBox'
import * as Immutable from 'seamless-immutable'
import styled, { injectGlobal } from '../styled'

export interface State {
  startIndex: number
  stopIndex: number
  users: any[]
  count: number
  query: string
  selectedRowIndex: number
  scrollToIndex?: number
}

export interface Props {
  adminAuthToken: string
  userFields: any[]
  onSelectUser: (user: any) => void
  isOpen: boolean
  onRequestClose: () => void
  endpointUrl: string
  userModelName: string
  modelNames: string[]
  onChangeUserModelName: (modelName: string) => void
}

export default class SelectUserPopup extends React.Component<Props, State> {
  private style: any
  private lastQuery: string

  constructor(props) {
    super(props)

    this.state = {
      startIndex: 0,
      stopIndex: 50,
      users: Immutable([]),
      query: '',
      count: 0,
      selectedRowIndex: -1,
      scrollToIndex: undefined,
    }

    this.getUsers({ startIndex: 0, stopIndex: 50 }, props.userFields)

    this.style = {
      ...modalStyle,
      overlay: modalStyle.overlay,
      content: {
        ...modalStyle.content,
        width: 'auto',
        minWidth: '600px',
        maxWidth: window.innerWidth - 100 + 'px',
      },
    } as any
    ;(global as any).s = this
  }

  componentWillReceiveProps(nextProps: Props) {
    const { startIndex, stopIndex } = this.state

    if (nextProps.userFields.length !== this.props.userFields.length) {
      this.getUsers({ startIndex, stopIndex }, nextProps.userFields)
    }
  }

  componentDidUpdate(props) {
    const { startIndex, stopIndex } = this.state
    if (props.userModelName !== this.props.userModelName) {
      this.getUsers({ startIndex, stopIndex }, this.props.userFields)
    }
  }

  render() {
    // put id to beginning
    return (
      <Modal
        isOpen={this.props.isOpen}
        onRequestClose={this.props.onRequestClose}
        contentLabel="Select a User"
        style={this.style}
      >
        <Wrapper>
          <SelectUser>
            <div>Select the User Model</div>
            <select
              value={this.props.userModelName}
              onChange={this.changeUserModelName}
            >
              {this.props.modelNames.map(name => (
                <option value={name}>{name}</option>
              ))}
            </select>
          </SelectUser>
          <TitleWrapper>
            <Title>Select a {this.props.userModelName}</Title>
            {this.state.selectedRowIndex > -1 && (
              <SelectedUser>
                <div>Selected {this.props.userModelName} ID</div>
                <SelectedUserId>
                  {this.state.users[this.state.selectedRowIndex].id}
                </SelectedUserId>
              </SelectedUser>
            )}
          </TitleWrapper>
          <Icon
            src={require('graphcool-styles/icons/stroke/cross.svg')}
            stroke={true}
            width={25}
            height={25}
            strokeWidth={2}
            className="popup-x"
            color={$v.gray50}
            onClick={this.props.onRequestClose}
          />
          <Search>
            <SearchBoxWrapper>
              <SearchBox
                placeholder="Search for a user ..."
                onSearch={this.handleSearch}
                isShown={true}
                clean={true}
              />
            </SearchBoxWrapper>
          </Search>
          <Table
            fields={this.props.userFields}
            rows={this.state.users}
            rowCount={this.state.count}
            loadMoreRows={this.getUsers}
            onRowSelection={this.handleRowSelection}
            scrollToIndex={this.state.scrollToIndex}
          />
        </Wrapper>
      </Modal>
    )
  }

  private changeUserModelName = e => {
    this.props.onChangeUserModelName(e.target.value)
  }

  private handleRowSelection = ({ index, rowData }) => {
    if (index === this.state.selectedRowIndex) {
      return
    }

    this.setState(state => {
      let { users } = state

      if (state.selectedRowIndex > -1) {
        users = Immutable.setIn(
          users,
          [state.selectedRowIndex, 'selected'],
          false,
        )
      }

      users = Immutable.setIn(users, [index, 'selected'], true)

      return {
        ...state,
        users,
        selectedRowIndex: index,
      }
    })

    this.props.onSelectUser(rowData)
  }

  private handleSearch = value => {
    this.setState({ query: value } as State, () => {
      const { startIndex, stopIndex } = this.state
      this.getUsers({ startIndex, stopIndex })
    })
  }

  getUsers = (
    { startIndex, stopIndex }: { startIndex: number; stopIndex: number },
    userFieldsInput?: string[],
  ) => {
    const { query } = this.state
    const userFields = userFieldsInput || this.props.userFields

    if (userFields.length === 0) {
      return
    }

    let filter = ''
    if (query && query.length > 0) {
      filter = ' filter: { OR: ['

      const whiteList = ['ID', 'String', 'Enum']

      const filtered = userFields.filter(field => {
        const typeName = field.type.name || field.type.ofType.name
        return whiteList.indexOf(typeName) > -1
      })

      filter += filtered
        .map(field => `{${field.name}_contains: "${query}"}`)
        .join(',\n')

      filter += ']}'
    }

    const count = stopIndex - startIndex
    const userQuery = `
      {
        _all${this.props.userModelName}sMeta {
          count
        }
        all${this.props.userModelName}s(skip: ${startIndex} first: ${count}${
      filter
    }){
          ${userFields.map(f => f.name).join('\n')}
        }
      }
    `

    fetch(this.props.endpointUrl, {
      // tslint:disable-line
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.props.adminAuthToken}`,
        'X-GraphCool-Source': 'playground',
      },
      body: JSON.stringify({ query: userQuery }),
    })
      .then(res => res.json())
      .then(res => {
        if (!res.data) {
          return
        }

        const allUsers = res.data[`all${this.props.userModelName}s`]
        /* tslint:disable */
        const _allUsersMeta = res.data[`_all${this.props.userModelName}sMeta`]

        let { users } = this.state

        // reset data if search changed
        if (query !== this.lastQuery) {
          users = Immutable([])
        }

        allUsers.forEach((user, i) => {
          users = Immutable.set(users, i + startIndex, user)
        })

        const newState: any = {
          users,
          count: _allUsersMeta.count,
        }

        if (this.lastQuery !== this.state.query) {
          newState.scrollToIndex = 0

          setTimeout(() => {
            this.setState({
              scrollToIndex: undefined,
            } as State)
          }, 150)
        }

        this.setState(newState as State)

        this.lastQuery = query
      })
      // tslint:disable-next-line
      .catch(e => console.error(e))
  }
}

injectGlobal`
  .popup-x.popup-x {
    position: absolute;
    right: 0;
    top: 0;
    cursor: pointer;
    padding-top: 25px;
    padding-right: 25px;
  }
`

const Wrapper = styled.div`
  margin-right: 25px;
  margin-left: 25px;
  position: relative;
  background: white;
`

const TitleWrapper = styled.div`
  width: 100%;
  padding: 45px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-bottom-style: solid;
  border-bottom-width: 1px;

  background: rgba(0, 0, 0, 0.1);
`

const Title = styled.div`
  font-size: 38px;
  font-weight: ${p => p.theme.sizes.fontLight};
  letter-spacing: 0.54px;
`

const Search = styled.div`
  position: absolute;
  box-sizing: border-box;
  z-index: 2;

  width: 100%;
  padding-top: 38px;
  padding-bottom: 38px;
`

const SearchBoxWrapper = styled.div`
  flex: 0 1 400px;
`

const SelectedUser = styled.div`
  margin-left: 25px;

  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`

const SelectedUserId = styled.div`
  padding: ${p => p.theme.sizes.small6};
  margin-top: ${p => p.theme.sizes.small10};

  font-size: ${p => p.theme.sizes.fontSmall};
  font-weight: ${p => p.theme.sizes.fontLight};
  font-family: 'Source Code Pro', 'Consolas', 'Inconsolata', 'Droid Sans Mono',
    'Monaco', monospace;

  border-radius: ${p => p.theme.sizes.smallRadius};
  background: ${p => p.theme.colours.black40};
  color: rgba(0, 0, 0, 0.6);
`

const SelectUser = styled.div`
  position: absolute;
  top: 25px;
  left: 38px;

  select {
    font-size: ${p => p.theme.sizes.fontMedium};
    margin-top: ${p => p.theme.sizes.small16};
  }
`
