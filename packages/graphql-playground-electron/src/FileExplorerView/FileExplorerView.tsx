import * as React from 'react'
import * as isURL from 'validator/lib/isURL'
import { remote } from 'electron'
import { existsSync } from 'fs'
import { resolve } from 'path'
import { Icon, $v } from 'graphcool-styles'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as format from 'date-fns/format'
import { setFiles, Files, SetFilesAction } from '../actions/files'
import * as Tree from 'react-ui-sortable-tree'

const electron = window.require('electron')
const ipcRenderer = electron.ipcRenderer

interface StateFromProps {
  files: Files[]
}

interface DispatchFromProps {
  setFiles: (files: Files) => any
}

interface State {
  active: string
  node: {
    from: string,
    module: string,
    to: string,
    type: string
  }
}


interface Props {
  config: {
    configDir: ''
    excludes: any[],
    includes: any[]
  }
}

class FileExplorer extends React.Component<
  Props & StateFromProps & DispatchFromProps,
  State
  > {
  state = {
    active: null,
    node: null
  }

  handleChange = () => {
    const { configDir, excludes, includes } = this.props.config
    this.state.node && ipcRenderer.send(
      'file-tree-moved',
      { configDir, excludes, includes, ...this.state.node }
    )
  }

  renderNode = node => {
    let label;

    if (node.module != null) {
      label = node.module.length < 24
        ? node.module
        : `${node.module.substr(0, 18)} ...`
    }

    return (
      <span
        onClick={event => this.handleOnClick(event, node)}
      >
        {label}
      </span>
    );
  }

  handleOnClick = (event, node) => {
    const { type, path, module } = node;

    if (type === 'file') {
      ipcRenderer.send('load-file-content', path)
    }
  }

  isNodeCollapsed = node => { }

  canMoveNode = (from, to, placement, parent) => {
    const { configDir } = this.props.config

    const parentPath = parent && parent.filePath || configDir

    this.setState({
      node: {
        from: from.filePath,
        module: from.module,
        to: parentPath,
        type: from.type
      }
    })

    return true;
  }

  render() {
    return (
      <div >
        <style jsx={true} global={true}>{`
          .tree {
            @p .relative, .overflowAuto, .ph25, .pv10;
            width: 172px;
            height: calc(100vh - 237px); 
            transition: all ease 0.1;
          }
          .tree .m-draggable {
            @p .absolute, .overflowHidden, .z1, .pv6, .ph4;
            opacity: 0.5;
            height: 16px;
            background: #515151;
            transition: all ease 0.1;     
          }
          .tree .node {
            @p .di, .w100, .pv4, .ph6;
            transition: all ease 0.1;
          }
          .tree .m-tree {
            user-select: none;
          }
          .tree .m-tree .m-node .placeholder {
            @p .overflowHidden, .pv6, .ph4;
            background: #515151; 
            height: 16px;
            color: #515151;
            transition: all ease 0.1;
          }
          .tree .m-tree .m-node .caret-right:before {
            @p .absolute, .bgWhite;
            left: -10px;
            content: '';
            -webkit-mask-image:  url(../icons/folder.svg);
            -webkit-mask-size: 20px;
            width: 20px; 
            height: 20px;
            transition: all ease 0.1;
          }
          .tree .m-tree .m-node .caret-down:before {
            @p .absolute, .bgWhite;
            left: -10px;
            content: '';
            -webkit-mask-image:  url(../icons/folder.svg);
            -webkit-mask-size: 20px;
            width: 20px; 
            height: 20px;
            transition: all ease 0.1;
          }
          .tree .m-tree .m-node .inner {
            @p .f12, .relative, .pl10;
            cursor: pointer;
            transition: all ease 0.1;
          }

        `}</style>
        <div className="tree m-tree-container">
          <Tree
            paddingLeft={20}
            tree={this.props.files}
            onChange={this.handleChange}
            isNodeCollapsed={this.isNodeCollapsed}
            renderNode={this.renderNode}
            canMoveNode={this.canMoveNode}
          />
        </div>
      </div>
    )
  }
}
const mapStateToProps = state => ({
  files: state.files.files
})

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      setFiles
    },
    dispatch
  )

export default connect<StateFromProps, DispatchFromProps, Props>(
  mapStateToProps,
  mapDispatchToProps
)(FileExplorer)