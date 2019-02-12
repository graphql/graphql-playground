import * as React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as keycode from 'keycode'
import { getLeft } from 'graphiql/dist/utility/elementPosition'
import {
  addStack,
  toggleDocs,
  changeWidthDocs,
  changeKeyMove,
  setDocsVisible,
} from '../../../state/docs/actions'
import { GraphQLSchema } from 'graphql'
import { getSessionDocs } from '../../../state/docs/selectors'
import { getSelectedSessionIdFromRoot } from '../../../state/sessions/selectors'
import { createStructuredSelector } from 'reselect'
import { styled } from '../../../styled'
import SideTab from './SideTab'

interface StateFromProps {
  docs: {
    navStack: any[]
    docsOpen: boolean
    docsWidth: number
    keyMove: boolean
    activeTabIdx: number
  }
}

interface DispatchFromProps {
  addStack: (sessionId: string, field: any, x: number, y: number) => any
  toggleDocs: (sessionId: string, activeTabIdx?: number | null) => any
  setDocsVisible: (sessionId: string, open: boolean, idx?: number | null) => any
  changeWidthDocs: (sessionId: string, width: number) => any
  changeKeyMove: (sessionId: string, move: boolean) => any
}

export interface Props {
  schema: GraphQLSchema
  sessionId: string
  children: Array<React.ReactElement<any>>
  maxWidth: number
}

export interface SideTabContentProps {
  schema: GraphQLSchema
  sessionId: string
  setWidth: (props: any) => any
}

export interface State {
  searchValue: string
  widthMap: any
}

class SideTabs extends React.Component<
  Props & StateFromProps & DispatchFromProps,
  State
> {
  ref
  public activeContentComponent: any // later React.Component<...>
  private refContentContainer: any
  private clientX: number = 0
  private clientY: number = 0
  constructor(props) {
    super(props)
    ;(window as any).d = this
  }

  setWidth = (props: any = this.props) => {
    if (!this.activeContentComponent) {
      return
    }
    if (!this.props.docs.docsOpen) {
      return
    }
    requestAnimationFrame(() => {
      const width = this.activeContentComponent.getWidth(props)
      this.props.changeWidthDocs(
        props.sessionId,
        Math.min(width, this.props.maxWidth),
      )
    })
  }
  setActiveContentRef = ref => {
    if (ref) {
      this.activeContentComponent = ref.getWrappedInstance()
    }
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.docs.activeTabIdx && this.props.docs.activeTabIdx) {
      this.props.setDocsVisible(
        this.props.sessionId,
        true,
        this.props.docs.activeTabIdx,
      )
    }
    if (prevProps.activeTabIdx && !this.props.docs.activeTabIdx) {
      this.props.setDocsVisible(this.props.sessionId, false)
    }
    this.setWidth()
    if (
      this.props.docs.activeTabIdx !== prevProps.docs.activeTabIdx &&
      this.refContentContainer
    ) {
      this.refContentContainer.focus()
    }
  }

  componentDidMount() {
    if (!this.props.docs.activeTabIdx) {
      this.props.setDocsVisible(this.props.sessionId, false)
    }
    return this.setWidth()
  }

  render() {
    const { docsOpen, docsWidth, activeTabIdx } = this.props.docs
    const docsStyle = { width: docsOpen ? docsWidth : 0 }
    const activeTab =
      docsOpen &&
      (React.Children.toArray(this.props.children)[
        activeTabIdx
      ] as React.ReactElement<any>)
    return (
      <Tabs open={docsOpen} style={docsStyle} ref={this.setRef}>
        <TabsContainer>
          {React.Children.toArray(this.props.children).map(
            (child: React.ReactElement<any>, index) => {
              return React.cloneElement(child, {
                ...child.props,
                key: index,
                onClick: this.handleTabClick(index),
                active: index === activeTabIdx,
              })
            },
          )}
        </TabsContainer>
        <TabContentResizer onMouseDown={this.handleDocsResizeStart} />
        <TabsGradient index={activeTabIdx} />
        <TabContentContainer
          onKeyDown={this.handleKeyDown}
          onMouseMove={this.handleMouseMove}
          tabIndex={activeTabIdx}
          color={activeTab && activeTab.props.activeColor}
          ref={this.setContentContainerRef}
        >
          {activeTab &&
            React.cloneElement(activeTab.props.children, {
              ...activeTab.props,
              ref: this.setActiveContentRef,
              setWidth: this.setWidth,
            })}
        </TabContentContainer>
      </Tabs>
    )
  }

  setRef = ref => {
    this.ref = ref
  }

  public showDocFromType = type => {
    this.props.setDocsVisible(this.props.sessionId, true, 0)
    this.activeContentComponent.showDocFromType(type)
  }

  private setContentContainerRef = ref => {
    this.refContentContainer = ref
  }

  private handleTabClick = idx => () => {
    if (this.props.docs.activeTabIdx === idx) {
      this.props.setDocsVisible(this.props.sessionId, false)
      return this.setWidth()
    }
    if (this.props.docs.activeTabIdx !== idx) {
      this.props.setDocsVisible(
        this.props.sessionId,
        false,
        this.props.docs.activeTabIdx,
      )
      this.props.setDocsVisible(this.props.sessionId, true, idx)
      return this.setWidth()
    } else {
      this.props.setDocsVisible(this.props.sessionId, true, idx)
      return this.setWidth()
    }
  }

  private handleKeyDown = e => {
    // we don't want to interfere with inputs
    if (
      e.target instanceof HTMLInputElement ||
      e.metaKey ||
      e.shiftKey ||
      e.altKey ||
      e.ctrlKey
    ) {
      return
    }
    const keyPressed = keycode(e)
    switch (keyPressed) {
      case 'esc':
        this.props.changeKeyMove(this.props.sessionId, true)
        e.preventDefault()
        this.props.setDocsVisible(this.props.sessionId, false)
        break
    }
  }

  private handleDocsResizeStart = downEvent => {
    downEvent.preventDefault()

    const hadWidth = this.props.docs.docsWidth
    const offset = downEvent.clientX - getLeft(downEvent.target)

    let onMouseMove: any = moveEvent => {
      if (moveEvent.buttons === 0) {
        return onMouseUp()
      }

      const app = this.ref
      const cursorPos = moveEvent.clientX - getLeft(app) - offset
      const newSize = app.clientWidth - cursorPos
      const maxSize = window.innerWidth - 50
      const docsSize = maxSize < newSize ? maxSize : newSize

      if (docsSize < 100) {
        this.props.setDocsVisible(
          this.props.sessionId,
          false,
          this.props.docs.activeTabIdx,
        )
      } else {
        this.props.setDocsVisible(
          this.props.sessionId,
          true,
          this.props.docs.activeTabIdx,
        )
        this.props.changeWidthDocs(this.props.sessionId, docsSize)
      }
    }

    let onMouseUp: any = () => {
      if (!this.props.docs.docsOpen) {
        this.props.changeWidthDocs(this.props.sessionId, hadWidth)
      }

      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      onMouseMove = null
      onMouseUp = null
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }
  private handleMouseMove = e => {
    this.clientX = e.clientX
    this.clientY = e.clientY
    if (
      this.props.docs.keyMove &&
      this.clientX !== e.clientX &&
      this.clientY !== e.clientY
    ) {
      this.props.changeKeyMove(this.props.sessionId, false)
    }
  }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      addStack,
      toggleDocs,
      changeWidthDocs,
      changeKeyMove,
      setDocsVisible,
    },
    dispatch,
  )

const mapStateToProps = createStructuredSelector({
  docs: getSessionDocs,
  sessionId: getSelectedSessionIdFromRoot,
})

const ConnectedGraphDocs = connect<StateFromProps, DispatchFromProps, Props>(
  mapStateToProps,
  mapDispatchToProps,
  null,
  { withRef: true },
)(SideTabs)

ConnectedGraphDocs.Tab = SideTab

export default ConnectedGraphDocs

interface TabsProps {
  open: boolean
}

const Tabs = styled<TabsProps, 'div'>('div')`
  background: white;
  outline: none;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.15);
  position: absolute;
  right: 0px;
  z-index: ${p => (p.open ? 2000 : 3)};
  height: 100%;
  font-family: 'Open Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  .doc-type-description p {
    padding: 16px;
    font-size: 14px;
  }
  .field-name {
    color: #1f61a0;
  }
  .type-name {
    color: rgb(245, 160, 0);
  }
  .arg-name {
    color: #1f61a9;
  }
  code {
    font-family: 'Source Code Pro', monospace;
    border-radius: 2px;
    padding: 1px 2px;
    background: rgba(0, 0, 0, 0.06);
  }
`

const TabContentContainer = styled.div`
  background: white;
  display: flex;
  position: relative;
  height: 100%;
  letter-spacing: 0.3px;
  box-shadow: -1px 1px 6px 0 rgba(0, 0, 0, 0.3);
  outline: none;
  &::before {
    top: 0;
    bottom: 0;
    background: ${props => props.theme.colours[props.color] || '#3D5866'};
    position: absolute;
    z-index: 3;
    left: 0px;
    content: '';
    width: 6px;
  }
`

const TabContentResizer = styled.div`
  cursor: col-resize;
  outline: none !important;
  height: 100%;
  left: -5px;
  position: absolute;
  top: 0;
  bottom: 0;
  width: 10px;
  z-index: 10;
`

const TabsContainer = styled.div`
  position: absolute;
  outline: none !important;
  z-index: 2;
  height: 0;
  top: 129px;
`

const TabsGradient = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 20px;
  z-index: 1;
  pointer-events: none;
  content: '';
  background: ${p =>
    p.index === 0
      ? `linear-gradient(
		to right,
		rgba(255, 255, 255, 1) 30%,
		rgba(255, 255, 255, 0))`
      : `transparent`};
`
