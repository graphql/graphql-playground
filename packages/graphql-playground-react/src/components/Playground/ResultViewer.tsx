/**
 *  Copyright (c) Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import * as React from 'react'
import { styled } from '../../styled'

export interface Props {
  value: string
  isSubscription: boolean
  hideGutters?: boolean
}

/**
 * ResultViewer
 *
 * Maintains an instance of CodeMirror for viewing a GraphQL response.
 *
 * Props:
 *
 *   - value: The text of the editor.
 *
 */
export class ResultViewer extends React.Component<Props, {}> {
  private node: any
  private viewer: any

  componentDidMount() {
    const CodeMirror = require('codemirror')
    require('codemirror/addon/fold/foldgutter')
    require('codemirror/addon/fold/brace-fold')
    require('codemirror/addon/dialog/dialog')
    require('codemirror/addon/search/search')
    require('codemirror/addon/search/searchcursor')
    require('codemirror/addon/search/jump-to-line')
    require('codemirror/keymap/sublime')
    require('codemirror-graphql/results/mode')

    const gutters: any[] = []
    if (!this.props.hideGutters) {
      gutters.push('CodeMirror-foldgutter')
    }
    let foldGutter: any = {}
    if (!this.props.hideGutters) {
      foldGutter = {
        minFoldSize: 4,
      }
    }

    const value = this.props.value || ''

    this.viewer = CodeMirror(this.node, {
      lineWrapping: true,
      value,
      readOnly: true,
      theme: 'graphiql',
      mode: 'graphql-results',
      keyMap: 'sublime',
      foldGutter,
      gutters,
      extraKeys: {
        // Persistent search box in Query Editor
        'Cmd-F': 'findPersistent',
        'Ctrl-F': 'findPersistent',

        // Editor improvements
        'Ctrl-Left': 'goSubwordLeft',
        'Ctrl-Right': 'goSubwordRight',
        'Alt-Left': 'goGroupLeft',
        'Alt-Right': 'goGroupRight',
      },
    })
  }

  shouldComponentUpdate(nextProps) {
    return this.props.value !== nextProps.value
  }

  componentDidUpdate() {
    const value = this.props.value || ''
    this.viewer.setValue(value)
  }

  componentWillUnmount() {
    this.viewer = null
  }

  render() {
    return (
      <Result ref={this.setRef} isSubscription={this.props.isSubscription} />
    )
  }

  setRef = ref => {
    this.node = ref
  }

  /**
   * Public API for retrieving the CodeMirror instance from this
   * React component.
   */
  getCodeMirror() {
    return this.viewer
  }

  /**
   * Public API for retrieving the DOM client height for this component.
   */
  getClientHeight() {
    return this.node && this.node.clientHeight
  }
}

interface ResultProps {
  isSubscription: boolean
}

const Result = styled<ResultProps, 'div'>('div')`
  position: relative;
  display: flex;
  flex: 1;
  height: ${props => (props.isSubscription ? 'auto' : '100%')};
  .CodeMirror {
    height: ${props => (props.isSubscription ? 'auto' : '100%')};
    position: ${props => (props.isSubscription ? 'relative' : 'absolute%')};
    box-sizing: border-box;
    background: none;
    padding-left: 38px;
  }
  .CodeMirror-cursor {
    display: none !important;
  }
  .CodeMirror-scroll {
    overflow: auto !important;
    max-width: 50vw;
    margin-right: 10px;
  }
  .CodeMirror-sizer {
    margin-bottom: 0 !important;
  }
  .CodeMirror-lines {
    margin: 20px 0;
    padding: 0;
  }
  .cm-string {
    color: ${p => p.theme.editorColours.property} !important;
  }
`
