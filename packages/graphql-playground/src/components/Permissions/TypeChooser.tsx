import * as React from 'react'
import * as cx from 'classnames'

export interface Props {
  modelSelected: boolean
  onToggle: () => void
}

export default class TypeChooser extends React.Component<Props, {}> {
  render() {
    const { modelSelected } = this.props
    return (
      <div className="root">
        <style jsx={true}>{`
          .root {
            @p: .fw6, .flex, .itemsCenter, .f14;
            color: rgba(255, 255, 255, .25);
          }

          .chooser {
            @p: .flex, .itemsCenter;
          }

          .choice {
            @p: .br2,
              .relative,
              .pointer,
              .ttu,
              .flex,
              .itemsCenter,
              .darkBlue80;
            padding: 3px 10px 4px 10px;
            margin: 0 -2px;
            background-color: $darkBlue10;
            &.active {
              @p: .bgBlue, .white;
              padding: 4px 10px 6px 10px;
              z-index: 2;
            }
          }
        `}</style>

        <div className="chooser">
          <div
            className={cx('choice', {
              active: modelSelected,
            })}
            onClick={this.props.onToggle}
          >
            Model
          </div>
          <div
            className={cx('choice', {
              active: !modelSelected,
            })}
            onClick={this.props.onToggle}
          >
            Relation
          </div>
        </div>
      </div>
    )
  }
}
