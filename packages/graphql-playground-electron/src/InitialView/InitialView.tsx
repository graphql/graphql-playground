import * as React from 'react'
import * as isURL from 'validator/lib/isURL'
import { remote } from 'electron'
import { existsSync } from 'fs'
import { resolve } from 'path'
import { Icon, $v } from 'graphcool-styles'
import Modal from 'graphcool-tmp-ui/lib/Modal'
import Toggle from 'graphcool-tmp-ui/lib/Toggle'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as format from 'date-fns/format'
import { selectHistory, History } from '../actions/history'

interface StateFromProps {
  history: History[]
}

interface DispatchFromProps {
  selectHistory: (history: History) => any
}

interface State {
  endpoint: string
  selectedMode: string
}

interface Props {
  isOpen: boolean
  onSelectEndpoint: (endpoint: string) => void
  onSelectFolder: (config: string) => void
}

class InitialView extends React.Component<
  Props & StateFromProps & DispatchFromProps,
  State
> {
  state = {
    endpoint: '',
    selectedMode: 'local',
  }

  handleRequestClose = () => null

  handleSubmit = e => {
    e.preventDefault()
    if (isURL(this.state.endpoint)) {
      this.props.selectHistory({
        type: 'endpoint',
        path: this.state.endpoint,
      })
      this.props.onSelectEndpoint(this.state.endpoint)
    } else {
      alert('Endpoint is not a valid url')
    }
  }

  handleClickLocal = () => {
    const paths = remote.dialog.showOpenDialog({
      properties: ['openDirectory'],
    })
    if (paths && paths[0]) {
      const path = paths[0]
      // Check if there is a .graphqlconfig file in the folder
      if (
        !existsSync(resolve(path, '.graphqlconfig')) &&
        !existsSync(resolve(path, '.graphqlconfig.yaml'))
      ) {
        alert('No .graphqlconfig (or .graphqlconfig.yaml) found in this folder')
        return
      }
      this.props.selectHistory({
        type: 'local',
        path,
      })
      this.setState({ endpoint: path } as State)
      this.props.onSelectFolder(path)
    }
  }

  handleChangeEndpoint = e => {
    this.setState({ endpoint: e.target.value } as State)
  }

  handleChangeMode = selectedMode => {
    this.setState({ selectedMode } as State)
  }

  handleClickHistory = (history: History) => {
    this.props.selectHistory(history)
    if (history.type === 'local') {
      this.props.onSelectFolder(history.path)
    } else {
      this.props.onSelectEndpoint(history.path)
    }
  }

  render() {
    const { isOpen, history } = this.props
    const { endpoint, selectedMode } = this.state
    const choicesMode = ['local', 'url endpoint']
    return (
      <div>
        <style jsx={true}>{`
          .initial-view-content {
            @p: .bgWhite, .flex, .flexRow;
          }
          .initial-view-recent {
            @p: .br, .bBlack10, .overflowHidden, .flex, .flexColumn;
            flex: 0 30%;
            max-height: 350px;
          }
          .initial-view-recent-header {
            @p: .pv10, .ph20, .bgBlack07, .black50, .bb, .bBlack10;
          }
          .initial-view-recent-list {
            @p: .flex1;
            overflow: auto;
          }
          .list-item {
            @p: .pv10, .ph20, .bb, .bBlack10, .pointer;
          }
          .list-item-name {
            @p: .f20, .black70, .fw6, .mb6, .toe, .overflowHidden, .nowrap;
          }
          .list-item-date {
            @p: .f12, .black40, .flex;
          }
          .list-item-date span {
            @p: .ml10;
          }
          .initial-view-workspace {
            @p: .flex1, .tc, .pv20;
          }
          .initial-view-workspace .title {
            @p: .maAuto, .black90;
          }
          .initial-view-workspace .description {
            @p: .maAuto, .black50, .mt16;
            max-width: 266px;
            margin-bottom: 80px !important;
          }
          .initial-view-workspace .toggle {
            @p: .justifyCenter, .flex;
          }
          .initial-view-workspace .container-input {
            @p: .ph10, .pv6, .mh38, .mt20, .black30, .ba, .bBlack10, .br2, .flex;
          }
          .initial-view-workspace .container-input input {
            @p: .black50, .w100;
          }
          .initial-view-workspace .container-input button {
            @p: .white, .br2, .pv6, .ph10, .pointer;
            background-color: #2a7ed3;
          }
        `}</style>
        <div className='dragable' />
        <Modal
          isOpen={isOpen}
          contentLabel="initial view"
          onRequestClose={this.handleRequestClose}
        >
          <div className="initial-view-content">
            <div className="initial-view-recent">
              <div className="initial-view-recent-header">RECENT</div>
              <div className="initial-view-recent-list">
                {history.map(data =>
                  <div
                    className="list-item"
                    // tslint:disable-next-line
                    onClick={() => this.handleClickHistory(data)}
                  >
                    <div className="list-item-name" title={data.path}>
                      {data.path}
                    </div>
                    <div className="list-item-date">
                      <Icon
                        src={
                          data.type === 'local'
                            ? require('../icons/folder.svg')
                            : require('graphcool-styles/icons/fill/world.svg')
                        }
                        color={$v.gray40}
                        width={14}
                        height={14}
                      />
                      <span>
                        Last opened {format(data.lastOpened, 'DD.MM.YYYY')}
                      </span>
                    </div>
                  </div>,
                )}
              </div>
            </div>
            <div className="initial-view-workspace">
              <h1 className="title">New workspace</h1>
              <p className="description">
                Either load a local repository with a .graphqlrc file, or just
                display a remote endpoint
              </p>
              <div className="toggle">
                <Toggle
                  choices={choicesMode}
                  activeChoice={selectedMode}
                  onChange={this.handleChangeMode}
                />
              </div>
              {selectedMode === 'local' &&
                <div
                  className="container-input"
                  onClick={this.handleClickLocal}
                >
                  <input
                    className="input"
                    placeholder="Select a folder..."
                    value={endpoint}
                    onChange={this.handleChangeEndpoint}
                  />
                  <button>OPEN</button>
                </div>}
              {selectedMode === 'url endpoint' &&
                <form className="container-input" onSubmit={this.handleSubmit}>
                  <input
                    className="input"
                    placeholder="Enter endpoint url..."
                    value={endpoint}
                    onChange={this.handleChangeEndpoint}
                  />
                  <button>OPEN</button>
                </form>}
            </div>
          </div>
        </Modal>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  history: state.history.history,
})

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      selectHistory,
    },
    dispatch,
  )

export default connect<StateFromProps, DispatchFromProps, Props>(
  mapStateToProps,
  mapDispatchToProps,
)(InitialView)
