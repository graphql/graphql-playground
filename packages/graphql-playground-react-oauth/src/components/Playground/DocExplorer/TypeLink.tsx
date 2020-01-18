import * as React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { GraphQLList, GraphQLNonNull, isType } from 'graphql'
import ArgumentInline from './ArgumentInline'
import { Triangle } from '../../Icons'
import { toJS } from '../util/toJS'
import { addStack } from '../../../state/docs/actions'
import { getSessionDocsState } from '../../../state/docs/selectors'
import {
  // getSelectedSessionId,
  getSelectedSessionIdFromRoot,
} from '../../../state/sessions/selectors'
import { createSelector } from 'reselect'
import { styled } from '../../../styled'

interface ReduxProps {
  keyMove: boolean
  isActive: boolean
}

interface DispatchFromProps {
  addStack: (sessionId: string, field: any, x: number, y: number) => any
}

export interface Props {
  type: any
  // X position in the list
  x: number
  // Y position in the list
  y: number
  clickable?: boolean
  className?: string
  beforeNode?: JSX.Element | null | false
  afterNode?: JSX.Element | null | false
  onSetWidth?: (width: number) => void
  showParentName?: boolean
  collapsable?: boolean
  lastActive: boolean
  sessionId: string
}

interface State {
  collapsed: boolean
}

class TypeLink extends React.Component<
  Props & ReduxProps & DispatchFromProps,
  State
> {
  static defaultProps: Partial<Props> = {
    clickable: true,
    collapsable: false,
  }
  private ref: any

  constructor(props) {
    super(props)
    this.state = {
      collapsed: false,
    }
  }

  shouldComponentUpdate(nextProps: Props & ReduxProps, nextState: State) {
    return (
      this.props.type !== nextProps.type ||
      this.props.keyMove !== nextProps.keyMove ||
      this.props.isActive !== nextProps.isActive ||
      this.state.collapsed !== nextState.collapsed
    )
  }

  onClick = () => {
    if (this.props.clickable) {
      this.props.addStack(
        this.props.sessionId,
        this.props.type,
        this.props.x,
        this.props.y,
      )
    }
  }

  componentDidMount() {
    this.updateSize()
  }

  componentDidUpdate() {
    this.updateSize()
  }

  updateSize() {
    if (this.ref) {
      if (typeof this.props.onSetWidth === 'function') {
        this.props.onSetWidth(this.ref.scrollWidth)
      }

      const LINE_HEIGHT = 31

      if (
        this.ref.scrollHeight > LINE_HEIGHT &&
        !this.state.collapsed &&
        this.props.collapsable
      ) {
        this.setState({ collapsed: true })
      }
    }
  }

  setRef = ref => {
    this.ref = ref
  }

  render() {
    const {
      type,
      clickable,
      className,
      beforeNode,
      afterNode,
      showParentName,
      isActive,
    } = this.props
    const isGraphqlType = isType(type)

    const fieldName =
      showParentName && type.parent ? (
        <span>
          {type.parent.name}.<b>{type.name}</b>
        </span>
      ) : (
        type.name
      )

    return (
      <DocsCategoryItem
        active={isActive}
        clickable={clickable}
        className={`doc-category-item${className ? className : ''}`}
        onClick={this.onClick}
        ref={this.setRef}
      >
        {beforeNode}
        {beforeNode && ' '}
        {!isGraphqlType && (
          <span>
            <span className="field-name">{fieldName}</span>
            {type.args &&
              type.args.length > 0 && [
                '(',
                <span key="args">
                  {this.state.collapsed ? (
                    <Dots>...</Dots>
                  ) : (
                    type.args.map(arg => (
                      <ArgumentInline key={arg.name} arg={arg} />
                    ))
                  )}
                </span>,
                ')',
              ]}
            {': '}
          </span>
        )}
        <span className="type-name">{renderType(type.type || type)}</span>
        {type.defaultValue !== undefined ? (
          <DefaultValue>
            {' '}
            = <span>{`${JSON.stringify(type.defaultValue, null, 2)}`}</span>
          </DefaultValue>
        ) : (
          undefined
        )}
        {clickable && (
          <IconBox>
            <Triangle />
          </IconBox>
        )}
        {afterNode && ' '}
        {afterNode}
      </DocsCategoryItem>
    )
  }
}

function renderType(type) {
  if (type instanceof GraphQLNonNull) {
    return (
      <span>
        {renderType(type.ofType)}
        {'!'}
      </span>
    )
  }
  if (type instanceof GraphQLList) {
    return (
      <span>
        {'['}
        {renderType(type.ofType)}
        {']'}
      </span>
    )
  }
  return <span>{type.name}</span>
}

const mapStateToProps = (state, { x, y }) => {
  const docs = getSessionDocsState(state)
  const sessionId = getSelectedSessionIdFromRoot(state)
  if (docs) {
    const nav = docs.navStack.get(x)
    if (nav) {
      const isActive = nav.get('x') === x && nav.get('y') === y
      return {
        isActive,
        keyMove: docs.keyMove,
        lastActive: isActive && x === docs.navStack.length - 1,
        sessionId,
      }
    }
  }
  return {
    isActive: false,
    keyMove: false,
    lastActive: false,
    sessionId,
  }
}

const selector = createSelector([mapStateToProps], s => s)

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      addStack,
    },
    dispatch,
  )

export default connect<ReduxProps, DispatchFromProps, Props>(
  selector,
  mapDispatchToProps,
)(toJS(TypeLink))

interface DocsCategoryItemProps {
  clickable?: boolean
  active?: boolean
}

const DocsCategoryItem = styled<DocsCategoryItemProps, 'div'>('div')`
  position: relative;
  padding: 6px 16px;
  overflow: auto;
  font-size: 14px;
  transition: 0.1s background-color;
  background: ${p =>
    p.active ? p.theme.colours.black07 : p.theme.colours.white};

  cursor: ${p => (p.clickable ? 'pointer' : 'select')};

  &:hover {
    color: ${p => p.theme.colours.white};
    background: #2a7ed3;
    .field-name,
    .type-name,
    .arg-name,
    span {
      color: ${p => p.theme.colours.white} !important;
    }
  }
  b {
    font-weight: 600;
  }
`

const Dots = styled.span`
  font-weight: 600;
`

const IconBox = styled.div`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
`

const DefaultValue = styled.span`
  color: ${p => p.theme.colours.black30};
  span {
    color: #1f61a9;
  }
`
