'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var className = require('classnames');
var debounce = require('lodash.debounce');

function normalizeLineEndings(str) {
  if (!str) return str;
  return str.replace(/\r\n|\r/g, '\n');
}

var CodeMirror = React.createClass({
  displayName: 'CodeMirror',

  propTypes: {
    className: React.PropTypes.any,
    codeMirrorInstance: React.PropTypes.func,
    defaultValue: React.PropTypes.string,
    onChange: React.PropTypes.func,
    onFocusChange: React.PropTypes.func,
    onScroll: React.PropTypes.func,
    options: React.PropTypes.object,
    path: React.PropTypes.string,
    value: React.PropTypes.string,
    preserveScrollPosition: React.PropTypes.bool
  },
  getDefaultProps: function getDefaultProps() {
    return {
      preserveScrollPosition: false
    };
  },
  getCodeMirrorInstance: function getCodeMirrorInstance() {
    return this.props.codeMirrorInstance || require('codemirror');
  },
  getInitialState: function getInitialState() {
    return {
      isFocused: false
    };
  },
  componentWillMount: function componentWillMount() {
    this.componentWillReceiveProps = debounce(this.componentWillReceiveProps, 0);
  },
  componentDidMount: function componentDidMount() {
    var textareaNode = this._textarea;
    var codeMirrorInstance = this.getCodeMirrorInstance();
    this.codeMirror = codeMirrorInstance.fromTextArea(textareaNode, this.props.options);
    this.codeMirror.on('change', this.codemirrorValueChanged);
    this.codeMirror.on('focus', this.focusChanged.bind(this, true));
    this.codeMirror.on('blur', this.focusChanged.bind(this, false));
    this.codeMirror.on('scroll', this.scrollChanged);
    this.codeMirror.setValue(this.props.defaultValue || this.props.value || '');
  },
  componentWillUnmount: function componentWillUnmount() {
    // is there a lighter-weight way to remove the cm instance?
    if (this.codeMirror) {
      this.codeMirror.toTextArea();
    }
  },
  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    if (this.codeMirror && nextProps.value !== undefined && normalizeLineEndings(this.codeMirror.getValue()) !== normalizeLineEndings(nextProps.value)) {
      if (this.props.preserveScrollPosition) {
        var prevScrollPosition = this.codeMirror.getScrollInfo();
        this.codeMirror.setValue(nextProps.value);
        this.codeMirror.scrollTo(prevScrollPosition.left, prevScrollPosition.top);
      } else {
        this.codeMirror.setValue(nextProps.value);
      }
    }
    if (typeof nextProps.options === 'object') {
      for (var optionName in nextProps.options) {
        if (nextProps.options.hasOwnProperty(optionName)) {
          this.codeMirror.setOption(optionName, nextProps.options[optionName]);
        }
      }
    }
  },
  getCodeMirror: function getCodeMirror() {
    return this.codeMirror;
  },
  focus: function focus() {
    if (this.codeMirror) {
      this.codeMirror.focus();
    }
  },
  focusChanged: function focusChanged(focused) {
    this.setState({
      isFocused: focused
    });
    this.props.onFocusChange && this.props.onFocusChange(focused);
  },
  scrollChanged: function scrollChanged(cm) {
    this.props.onScroll && this.props.onScroll(cm.getScrollInfo());
  },
  codemirrorValueChanged: function codemirrorValueChanged(doc, change) {
    if (this.props.onChange && change.origin !== 'setValue') {
      this.props.onChange(doc.getValue(), change);
    }
  },
  render: function render() {
    var _this = this;

    var editorClassName = className('ReactCodeMirror', this.state.isFocused ? 'ReactCodeMirror--focused' : null, this.props.className);
    return React.createElement(
      'div',
      { className: editorClassName },
      React.createElement('textarea', {
        ref: function (textarea) {
          return _this._textarea = textarea;
        },
        name: this.props.path,
        defaultValue: this.props.value,
        autoComplete: 'off'
      })
    );
  }
});

module.exports = CodeMirror;
