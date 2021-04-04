import * as React from 'react'
import { styled, createGlobalStyle } from '../../styled'

const EditorWrapper = styled.div`
  /* Comment */
  .cm-comment {
    color: ${p => p.theme.editorColours.comment};
  }

  /* Punctuation */
  .cm-punctuation {
    color: ${p => p.theme.editorColours.punctuation};
  }

  /* Proppery */
  .cm-property {
    color: ${p => p.theme.editorColours.property};
  }

  /* Keyword */
  .cm-keyword {
    color: ${p => p.theme.editorColours.keyword};
  }

  /* OperationName, FragmentName */
  .cm-def {
    color: ${p => p.theme.editorColours.def};
  }

  /* FieldAlias */
  .cm-qualifier {
    color: ${p => p.theme.editorColours.def};
  }

  /* ArgumentName and ObjectFieldName */
  .cm-attribute {
    color: ${p => p.theme.editorColours.attribute};
  }

  /* Number */
  .cm-number {
    color: ${p => p.theme.editorColours.number};
  }

  /* String */
  .cm-string {
    color: ${p => p.theme.editorColours.string};
  }

  /* Boolean */
  .cm-builtin {
    color: ${p => p.theme.editorColours.builtin};
  }

  /* EnumValue */
  .cm-string-2 {
    color: ${p => p.theme.editorColours.string2};
  }

  /* Variable */
  .cm-variable {
    color: ${p => p.theme.editorColours.variable};
  }

  /* Directive */
  .cm-meta {
    color: ${p => p.theme.editorColours.meta};
  }

  /* Type */
  .cm-atom {
    color: ${p => p.theme.editorColours.atom};
  }

  /* Comma */
  .cm-ws {
    color: ${p => p.theme.editorColours.ws};
  }
  position: relative;
  display: flex;
  flex: 1 1 0%;
  flex-flow: column;

  .CodeMirror {
    color: rgba(255, 255, 255, 0.3);
    font-family: ${p => p.theme.settings['editor.fontFamily']};
    font-size: ${p => `${p.theme.settings['editor.fontSize']}px`};
    height: 100%;
    left: 0;
    position: absolute;
    top: 0;
    width: 100%;
  }

  .CodeMirror-lines {
    padding: 20px 0;
  }

  .CodeMirror-gutters {
    border-right: none;
  }

  .CodeMirror span[role='presentation'] {
    color: ${p => p.theme.colours.text};
  }

  /* CURSOR */

  .CodeMirror div.CodeMirror-cursor {
    background: ${p =>
      p.theme.settings['editor.cursorShape'] === 'block'
        ? p.theme.editorColours.cursorColor
        : 'transparent'};
    border-left: ${p =>
      p.theme.settings['editor.cursorShape'] === 'line'
        ? `1px solid ${p.theme.editorColours.cursorColor}`
        : 0};
    border-bottom: ${p =>
      p.theme.settings['editor.cursorShape'] === 'underline'
        ? `1px solid ${p.theme.editorColours.cursorColor}`
        : 0};
  }
  /* Shown when moving in bi-directional text */
  .CodeMirror div.CodeMirror-secondarycursor {
    border-left: 1px solid silver;
  }
  .CodeMirror.cm-fat-cursor div.CodeMirror-cursor {
    background: rgba(255, 255, 255, 0.6);
    color: white;
    border: 0;
    width: auto;
  }
  .CodeMirror.cm-fat-cursor div.CodeMirror-cursors {
    z-index: 1;
  }

  .cm-animate-fat-cursor {
    -webkit-animation: blink 1.06s steps(1) infinite;
    animation: blink 1.06s steps(1) infinite;
    border: 0;
    width: auto;
  }
  @-webkit-keyframes blink {
    0% {
      background: #7e7;
    }
    50% {
      background: none;
    }
    100% {
      background: #7e7;
    }
  }
  @keyframes blink {
    0% {
      background: #7e7;
    }
    50% {
      background: none;
    }
    100% {
      background: #7e7;
    }
  }

  .CodeMirror-foldmarker {
    border-radius: 4px;
    background: #08f;
    background: linear-gradient(#43a8ff, #0f83e8);
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(0, 0, 0, 0.1);
    color: white;
    font-family: arial;
    font-size: 12px;
    line-height: 0;
    margin: 0 3px;
    padding: 0px 4px 1px;
    text-shadow: 0 -1px rgba(0, 0, 0, 0.1);
  }

  div.CodeMirror span.CodeMirror-matchingbracket {
    /* color: rgba(255, 255, 255, 0.4); */
    text-decoration: underline;
  }

  div.CodeMirror span.CodeMirror-nonmatchingbracket {
    color: rgb(242, 92, 84);
  }

  .toolbar-button {
    background: #fdfdfd;
    background: linear-gradient(#fbfbfb, #f8f8f8);
    border-color: #d3d3d3 #d0d0d0 #bababa;
    border-radius: 4px;
    border-style: solid;
    border-width: 0.5px;
    box-shadow: 0 1px 1px -1px rgba(0, 0, 0, 0.13), inset 0 1px #fff;
    color: #444;
    cursor: pointer;
    display: inline-block;
    margin: 0 5px 0;
    padding: 2px 8px 4px;
    text-decoration: none;
  }
  .toolbar-button:active {
    background: linear-gradient(#ececec, #d8d8d8);
    border-color: #cacaca #c9c9c9 #b0b0b0;
    box-shadow: 0 1px 0 #fff, inset 0 1px rgba(255, 255, 255, 0.2),
      inset 0 1px 1px rgba(0, 0, 0, 0.08);
  }
  .toolbar-button.error {
    background: linear-gradient(#fdf3f3, #e6d6d7);
    color: #b00;
  }

  .autoInsertedLeaf.cm-property {
    -webkit-animation-duration: 6s;
    animation-duration: 6s;
    -webkit-animation-name: insertionFade;
    animation-name: insertionFade;
    border-bottom: 2px solid rgba(255, 255, 255, 0);
    border-radius: 2px;
    margin: -2px -4px -1px;
    padding: 2px 4px 1px;
  }

  @-webkit-keyframes insertionFade {
    from,
    to {
      background: rgba(255, 255, 255, 0);
      border-color: rgba(255, 255, 255, 0);
    }

    15%,
    85% {
      background: #fbffc9;
      border-color: #f0f3c0;
    }
  }

  @keyframes insertionFade {
    from,
    to {
      background: rgba(255, 255, 255, 0);
      border-color: rgba(255, 255, 255, 0);
    }

    15%,
    85% {
      background: #fbffc9;
      border-color: #f0f3c0;
    }
  }

  .CodeMirror pre {
    padding: 0 4px; /* Horizontal padding of content */
  }

  .CodeMirror-scrollbar-filler,
  .CodeMirror-gutter-filler {
    background-color: white; /* The little square between H and V scrollbars */
  }

  /* GUTTER */

  .CodeMirror-gutters {
    background-color: transparent;
    border: none;
    white-space: nowrap;
  }
  .CodeMirror-linenumbers {
    background: ${p => p.theme.editorColours.editorBackground};
  }
  .CodeMirror-linenumber {
    font-family: Open Sans, sans-serif;
    font-weight: 600;
    font-size: ${p => `${p.theme.settings['editor.fontSize'] - 2}px`};
    color: ${p => p.theme.colours.textInactive};
    min-width: 20px;
    padding: 0 3px 0 5px;
    text-align: right;
    white-space: nowrap;
  }

  .CodeMirror-guttermarker {
    color: black;
  }
  .CodeMirror-guttermarker-subtle {
    color: #999;
  }

  .cm-tab {
    display: inline-block;
    text-decoration: inherit;
  }

  .CodeMirror-ruler {
    border-left: 1px solid #ccc;
    position: absolute;
  }
  .cm-negative {
    color: #d44;
  }
  .cm-positive {
    color: #292;
  }
  .cm-header,
  .cm-strong {
    font-weight: bold;
  }
  .cm-em {
    font-style: italic;
  }
  .cm-link {
    text-decoration: underline;
  }
  .cm-strikethrough {
    text-decoration: line-through;
  }

  .cm-s-default .cm-error {
    color: #f00;
  }
  .cm-invalidchar {
    color: #f00;
  }

  .CodeMirror-composing {
    border-bottom: 2px solid;
  }
  .CodeMirror-matchingtag {
    background: rgba(255, 150, 0, 0.3);
  }
  .CodeMirror-activeline-background {
    background: #e8f2ff;
  }

  /* The rest of this file contains styles related to the mechanics of
   the editor. You probably shouldn't touch them. */

  .CodeMirror {
    background: white;
    overflow: hidden;
    line-height: 1.6;
  }

  .CodeMirror-scroll {
    height: 100%;
    /* 30px is the magic margin used to hide the element's real scrollbars */
    /* See overflow: hidden in .CodeMirror */
    /* margin-bottom: -30px;
    margin-right: -30px; */
    outline: none; /* Prevent dragging from highlighting the element */
    overflow: hidden;
    /* padding-bottom: 30px; */
    position: relative;
    &:hover {
      overflow: scroll !important;
    }
  }
  .CodeMirror-sizer {
    border-right: 30px solid transparent;
    position: relative;
  }

  /* The fake, visible scrollbars. Used to force redraw during scrolling
   before actual scrolling happens, thus preventing shaking and
   flickering artifacts. */
  .CodeMirror-vscrollbar,
  .CodeMirror-hscrollbar,
  .CodeMirror-scrollbar-filler,
  .CodeMirror-gutter-filler {
    display: none !important;
    position: absolute;
    z-index: 6;
  }
  .CodeMirror-vscrollbar {
    overflow-x: hidden;
    overflow-y: scroll;
    right: 0;
    top: 0;
  }
  .CodeMirror-hscrollbar {
    bottom: 0;
    left: 0;
    overflow-x: scroll;
    overflow-y: hidden;
  }
  .CodeMirror-scrollbar-filler {
    right: 0;
    bottom: 0;
  }
  .CodeMirror-gutter-filler {
    left: 0;
    bottom: 0;
  }

  .CodeMirror-gutters {
    min-height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 3;
    margin-left: 3px;
  }
  .CodeMirror-gutter {
    display: inline-block;
    height: 100%;
    margin-bottom: -30px;
    vertical-align: top;
    white-space: normal;
    /* Hack to make IE7 behave */
    *zoom: 1;
    *display: inline;
  }
  .CodeMirror-gutter-wrapper {
    background: none !important;
    border: none !important;
    position: absolute;
    z-index: 4;
  }
  .CodeMirror-gutter-background {
    position: absolute;
    top: 0;
    bottom: 0;
    z-index: 4;
  }
  .CodeMirror-gutter-elt {
    cursor: default;
    position: absolute;
    z-index: 4;
  }
  .CodeMirror-gutter-wrapper {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .CodeMirror-lines {
    cursor: text;
    min-height: 1px; /* prevents collapsing before first draw */
  }
  .CodeMirror pre {
    -webkit-tap-highlight-color: transparent;
    /* Reset some styles that the rest of the page might have set */
    background: transparent;
    border-radius: 0;
    border-width: 0;
    color: inherit;
    font-family: inherit;
    font-size: inherit;
    -webkit-font-variant-ligatures: none;
    font-variant-ligatures: none;
    line-height: inherit;
    margin: 0;
    overflow: visible;
    position: relative;
    white-space: pre;
    word-wrap: normal;
    z-index: 2;
  }
  .CodeMirror-wrap pre {
    word-wrap: break-word;
    white-space: pre-wrap;
    word-break: normal;
  }

  .CodeMirror-linebackground {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 0;
  }

  .CodeMirror-linewidget {
    overflow: auto;
    position: relative;
    z-index: 2;
  }

  .CodeMirror-widget {
  }

  .CodeMirror-code {
    outline: none;
  }

  /* Force content-box sizing for the elements where we expect it */
  .CodeMirror-scroll,
  .CodeMirror-sizer,
  .CodeMirror-gutter,
  .CodeMirror-gutters,
  .CodeMirror-linenumber {
    box-sizing: content-box;
  }

  .CodeMirror-measure {
    height: 0;
    overflow: hidden;
    position: absolute;
    visibility: hidden;
    width: 100%;
  }

  .CodeMirror-cursor {
    position: absolute;
  }
  .CodeMirror-measure pre {
    position: static;
  }

  div.CodeMirror-cursors {
    position: relative;
    visibility: hidden;
    z-index: 3;
  }
  div.CodeMirror-dragcursors {
    visibility: visible;
  }

  .CodeMirror-focused div.CodeMirror-cursors {
    visibility: visible;
  }

  .CodeMirror-selected {
    background: ${p => p.theme.editorColours.selection};
  }
  .CodeMirror-focused .CodeMirror-selected {
    background: ${p => p.theme.editorColours.selection};
  }
  .CodeMirror-crosshair {
    cursor: crosshair;
  }
  .CodeMirror-line::-moz-selection,
  .CodeMirror-line > span::-moz-selection,
  .CodeMirror-line > span > span::-moz-selection {
    background: ${p => p.theme.editorColours.selection};
  }
  .CodeMirror-line::selection,
  .CodeMirror-line > span::selection,
  .CodeMirror-line > span > span::selection {
    background: ${p => p.theme.editorColours.selection};
  }
  .CodeMirror-line::-moz-selection,
  .CodeMirror-line > span::-moz-selection,
  .CodeMirror-line > span > span::-moz-selection {
    background: ${p => p.theme.editorColours.selection};
  }

  .cm-searching {
    background: #ffa;
    background: rgba(255, 255, 0, 0.4);
  }

  /* IE7 hack to prevent it from returning funny offsetTops on the spans */
  .CodeMirror span {
    *vertical-align: text-bottom;
  }

  /* Used to force a border model for a node */
  .cm-force-border {
    padding-right: 0.1px;
  }

  @media print {
    /* Hide the cursor when printing */
    .CodeMirror div.CodeMirror-cursors {
      visibility: hidden;
    }
  }

  /* See issue #2901 */
  .cm-tab-wrap-hack:after {
    content: '';
  }

  /* Help users use markselection to safely style text background */
  span.CodeMirror-selectedtext {
    background: none;
  }

  .CodeMirror-dialog {
    background: inherit;
    color: inherit;
    left: 0;
    right: 0;
    overflow: hidden;
    padding: 0.1em 0.8em;
    position: absolute;
    z-index: 15;
  }

  .CodeMirror-dialog-top {
    border-bottom: 1px solid #eee;
    top: 0;
  }

  .CodeMirror-dialog-bottom {
    border-top: 1px solid #eee;
    bottom: 0;
  }

  .CodeMirror-dialog input {
    background: transparent;
    border: 1px solid #d3d6db;
    color: inherit;
    font-family: monospace;
    outline: none;
    width: 20em;
  }

  .CodeMirror-dialog span.CodeMirror-search-label {
    color: ${p => p.theme.colours.text};
  }

  .CodeMirror-dialog input.CodeMirror-search-field {
    color: ${p => p.theme.colours.text};
    background: ${p => p.theme.colours.background};
  }

  .CodeMirror-dialog button {
    font-size: 70%;
  }

  .CodeMirror-foldgutter {
    width: 0.7em;
  }
  .CodeMirror-foldgutter-open,
  .CodeMirror-foldgutter-folded {
    cursor: pointer;
  }
  .CodeMirror-foldgutter-open:after {
    content: '▾';
  }
  .CodeMirror-foldgutter-folded:after {
    content: '▸';
  }
  /* The lint marker gutter */
  .CodeMirror-lint-markers {
    width: 16px;
  }

  .CodeMirror-jump-token {
    cursor: pointer;
    text-decoration: underline;
  }
`

// Styling of portal for hints
// .CodeMirror-info info for types breaks stack trace
// tslint:disable-next-line
const GlobalStyle = createGlobalStyle`
  *::-webkit-scrollbar {
    -webkit-appearance: none;
    width: 7px;
    height: 7px;
  }
  *::-webkit-scrollbar-track-piece {
    background-color: rgba(255, 255, 255, 0);
  }
  *::-webkit-scrollbar-track {
    background-color: inherit;
  }
  *::-webkit-scrollbar-thumb {
    max-height: 100px;
    border-radius: 3px;
    background-color: rgba(1, 1, 1, 0.23);
  }
  *::-webkit-scrollbar-thumb:hover {
    background-color: rgba(1, 1, 1, 0.35);
  }
  *::-webkit-scrollbar-thumb:active {
    background-color: rgba(1, 1, 1, 0.48);
  }
  *::-webkit-scrollbar-corner {
    background: rgba(0,0,0,0);
  }


  .CodeMirror-lint-tooltip, .CodeMirror-info {
    background-color: white;
    border-radius: 4px 4px 4px 4px;
    border: 1px solid black;
    color: #09141C;
    font-family: Open Sans, monospace;
    font-size: 14px;
    max-width: 600px;
    opacity: 0;
    overflow: hidden;
    padding: 12px 14px;
    position: fixed;
    -webkit-transition: opacity 0.4s;
    transition: opacity 0.4s;
    z-index: 100;
  }

  .CodeMirror-lint-message-error,
  .CodeMirror-lint-message-warning {
    padding-left: 18px;
  }

  .CodeMirror-lint-mark-error,
  .CodeMirror-lint-mark-warning {
    background-position: left bottom;
    background-repeat: repeat-x;
  }

  .CodeMirror-lint-mark-error {
    background-image: url('data:image/svg+xml;utf8,<svg width="5" height="4" viewBox="0 0 5 4" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 1.00954C4.87191 1.03474 4.75219 1.10989 4.674 1.235L3.87 2.52141C3.28249 3.46141 1.9135 3.46141 1.326 2.52141L0.521998 1.235C0.404356 1.04677 0.19271 0.971619 0 1.00954V0.00314821C0.0325855 0.00105209 0.0652291 2.68503e-06 0.0978728 5.14592e-09C0.0977892 -1.71531e-09 0.0979564 -1.71531e-09 0.0978728 5.14592e-09C0.586954 4.01563e-05 1.07627 0.235041 1.37 0.705002L2.174 1.99141C2.36983 2.30474 2.82616 2.30474 3.022 1.99141L3.826 0.705002C4.10012 0.266408 4.54438 0.0324569 5 0.00314818V1.00954Z" fill="#FF4F56"/>
    </svg>
    ');
  }

  .CodeMirror-lint-mark-warning {
    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAYAAAC09K7GAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9sJFhQXEbhTg7YAAAAZdEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIEdJTVBXgQ4XAAAAMklEQVQI12NkgIIvJ3QXMjAwdDN+OaEbysDA4MPAwNDNwMCwiOHLCd1zX07o6kBVGQEAKBANtobskNMAAAAASUVORK5CYII=');
  }

  .CodeMirror-lint-marker-error,
  .CodeMirror-lint-marker-warning {
    background-position: center center;
    background-repeat: no-repeat;
    cursor: pointer;
    display: inline-block;
    height: 16px;
    position: relative;
    vertical-align: middle;
    width: 16px;
  }

  .CodeMirror-lint-message-error,
  .CodeMirror-lint-message-warning {
    background-position: top left;
    background-repeat: no-repeat;
    padding-left: 22px;
  }

  .CodeMirror-lint-marker-error,
  .CodeMirror-lint-message-error {
    background-image: url('data:image/svg+xml;utf8,<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="8" r="8" fill="#FF4F56"/>
    <path d="M4.2929 10.2928C3.90237 10.6833 3.90237 11.3164 4.29289 11.707C4.68341 12.0975 5.31657 12.0975 5.7071 11.707L4.2929 10.2928ZM11.7071 5.70711C12.0976 5.31659 12.0976 4.68343 11.7071 4.2929C11.3166 3.90237 10.6834 3.90237 10.2929 4.29289L11.7071 5.70711ZM5.7071 4.29301C5.31657 3.90249 4.68341 3.9025 4.29289 4.29302C3.90237 4.68355 3.90237 5.31672 4.2929 5.70724L5.7071 4.29301ZM10.2929 11.7071C10.6834 12.0976 11.3166 12.0976 11.7071 11.7071C12.0976 11.3166 12.0976 10.6834 11.7071 10.2929L10.2929 11.7071ZM5.7071 11.707L11.7071 5.70711L10.2929 4.29289L4.2929 10.2928L5.7071 11.707ZM4.2929 5.70724L10.2929 11.7071L11.7071 10.2929L5.7071 4.29301L4.2929 5.70724Z" fill="white"/>
    </svg>
    ');
    background-position: 0 50%;
  }

  .CodeMirror-lint-marker-warning,
  .CodeMirror-lint-message-warning {
    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAANlBMVEX/uwDvrwD/uwD/uwD/uwD/uwD/uwD/uwD/uwD6twD/uwAAAADurwD2tQD7uAD+ugAAAAD/uwDhmeTRAAAADHRSTlMJ8mN1EYcbmiixgACm7WbuAAAAVklEQVR42n3PUQqAIBBFUU1LLc3u/jdbOJoW1P08DA9Gba8+YWJ6gNJoNYIBzAA2chBth5kLmG9YUoG0NHAUwFXwO9LuBQL1giCQb8gC9Oro2vp5rncCIY8L8uEx5ZkAAAAASUVORK5CYII=');
  }

  .CodeMirror-lint-marker-multiple {
    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAHCAMAAADzjKfhAAAACVBMVEUAAAAAAAC/v7914kyHAAAAAXRSTlMAQObYZgAAACNJREFUeNo1ioEJAAAIwmz/H90iFFSGJgFMe3gaLZ0od+9/AQZ0ADosbYraAAAAAElFTkSuQmCC');
    background-position: right bottom;
    background-repeat: no-repeat;
    width: 100%;
    height: 100%;
  }

  .CodeMirror-lint-mark-error {
    &:before {
      content: '';
      width: 50px;
      height: 14px;
      position: absolute;
      background: #FF4F56;
      left: -80px;
      top: 50%;
      transform: translateY(-50%);
      z-index: 10;
    }
  }

  .CodeMirror-lint-message-error span {
    color: white;
    background: #FF4F56;
    font-family: 'Source Code Pro', monospace;
    font-weight: 600;
    border-radius: 2px;
    padding: 0 4px;
  }

  .CodeMirror-hints {
    background: white;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
    font-size: 14px;
    list-style: none;
    margin-left: -6px;
    margin: 0;
    max-height: 20em;
    overflow: hidden;
    padding: 0;
    position: absolute;
    z-index: 10;
    border-radius: 2px;
    top: 0;
    left: 0;
    &:hover {
      overflow-y: overlay;
    }
  }

  .CodeMirror-hints-wrapper {
    font-family: 'Open Sans', sans-serif;
    background: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.45);
    margin-left: -6px;
    position: absolute;
    z-index: 10;
  }

  .CodeMirror-hints-wrapper .CodeMirror-hints {
    box-shadow: none;
    margin-left: 0;
    position: relative;
    z-index: 0;
  }

  .CodeMirror-hint {
    color: rgba(15, 32, 45, 0.6);
    cursor: pointer;
    margin: 0;
    max-width: 300px;
    overflow: hidden;
    padding: 6px 12px;
    white-space: pre;
  }

  li.CodeMirror-hint-active {
    background-color: #2a7ed3;
    border-top-color: white;
    color: white;
  }

  .CodeMirror-hint-information {
    border-top: solid 1px rgba(0, 0, 0, 0.1);
    max-width: 300px;
    padding: 10px 12px;
    position: relative;
    z-index: 1;
    background-color: rgba(15, 32, 45, 0.03);
    font-size: 14px;
  }

  .CodeMirror-hint-information:first-child {
    border-bottom: solid 1px #c0c0c0;
    border-top: none;
    margin-bottom: -1px;
  }

  .CodeMirror-hint-information .content {
    color: rgba(15, 32, 45, 0.6);
    box-orient: vertical;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    line-clamp: 3;
    line-height: 1.36;
    max-height: 59px;
    overflow: hidden;
    text-overflow: -o-ellipsis-lastline;
  }

  .CodeMirror-hint-information .content p:first-child {
    margin-top: 0;
  }

  .CodeMirror-hint-information .content p:last-child {
    margin-bottom: 0;
  }

  .CodeMirror-hint-information .infoType {
    color: rgb(241, 143, 1);
    cursor: pointer;
    display: inline;
    margin-right: 0.5em;
  }
`

const Wrapper = ({ children }) => {
  function lintMessage(e) {
    if (e.target.classList.contains('CodeMirror-lint-mark-error')) {
      const items = document.getElementsByClassName(
        'CodeMirror-lint-message-error',
      )
      for (const item of Array.from(items)) {
        item.innerHTML = item.innerHTML.replace(/"(.*?)"/g, '<span>$1</span>')
      }
    }
  }
  return (
    <EditorWrapper onMouseMove={lintMessage}>
      {children}
      <GlobalStyle />
    </EditorWrapper>
  )
}

const GraphqlContainer = styled.div`
  color: #141823;
  display: flex;
  flex-direction: row;
  font-family: system, -apple-system, 'San Francisco', '.SFNSDisplay-Regular',
    'Segoe UI', Segoe, 'Segoe WP', 'Helvetica Neue', helvetica, 'Lucida Grande',
    arial, sans-serif;
  font-size: 14px;
  height: 100%;
  margin: 0;
  overflow: hidden;
  width: 100%;
`

export class Container extends React.PureComponent {
  private graphqlContainer

  render() {
    return (
      <GraphqlContainer ref={this.setGraphqlContainer}>
        {this.props.children}
      </GraphqlContainer>
    )
  }

  getWidth = () => {
    return this.graphqlContainer.offsetWidth
  }

  private setGraphqlContainer = ref => {
    this.graphqlContainer = ref
  }
}

export default Wrapper
