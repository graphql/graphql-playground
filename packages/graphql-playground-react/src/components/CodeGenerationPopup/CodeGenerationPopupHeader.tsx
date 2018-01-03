import * as React from 'react' // tslint:disable-line
import { $p } from 'graphcool-styles'
import * as cx from 'classnames'

export interface Props {
  queryActive: boolean
}

export default (props: Props) =>
  <div
    className={cx(
      $p.flex,
      $p.justifyCenter,
      $p.black,
      $p.itemsCenter,
      $p.w100,
      'container',
    )}
  >
    <style jsx={true}>{`
      .container {
        height: 103px;
      }
    `}</style>
    <div className={cx($p.f25, $p.fw3, $p.flex, $p.flexRow, $p.itemsCenter)}>
      Generate Code for your
      <div className={cx($p.fw6, $p.ml6)}>
        {props.queryActive ? 'Query' : 'Mutation'}
      </div>
    </div>
  </div>
