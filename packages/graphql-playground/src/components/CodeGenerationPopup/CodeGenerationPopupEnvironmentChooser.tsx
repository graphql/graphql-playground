import * as React from 'react' // tslint:disable-line
import { $p } from 'graphcool-styles'
import * as cx from 'classnames'
import calculateSize from 'calculate-size'
import { Environment } from '../../types'

const environments = ['Node', 'Browser', 'Cli']

export interface Props {
  environment: Environment
  setEnvironment: (data: any) => void
}

const Chooser = (props: Props) =>
  <div className={cx($p.bt, $p.bb, $p.bBlack10, $p.flex1)}>
    <style jsx={true}>{`
      .condition-button:not(.bgGreen):hover {
        background-color: $gray10;
      }
    `}</style>
    <div
      className={cx($p.pa38, $p.pt16, $p.flex, $p.flexColumn, $p.itemsCenter)}
    >
      <h2 className={cx($p.fw3, $p.mb10, $p.tc)}>Environment</h2>
      <div className={cx($p.dib, $p.mt25)}>
        <div
          className={cx(
            $p.flex,
            $p.flexRow,
            $p.justifyAround,
            $p.ph16,
            $p.pv6,
            $p.relative,
            $p.itemsCenter,
          )}
        >
          {environments.map(env => {
            const { width } = calculateSize(env.toUpperCase(), {
              fontSize: '14px',
              fontWeight: '600',
            })

            return (
              <div
                className={cx(
                  $p.relative,
                  $p.flex,
                  $p.itemsCenter,
                  $p.justifyCenter,
                  $p.pointer,
                )}
                onClick={() => props.setEnvironment(env)}
                style={{ width: width + 15 }}
                key={env}
              >
                <div
                  className={cx(
                    'condition-button',
                    $p.nowrap,
                    $p.absolute,
                    $p.ph10,
                    $p.flex,
                    $p.flexRow,
                    $p.itemsCenter,
                    {
                      [cx($p.pv6, $p.bgBlack04)]: props.environment !== env,
                      [cx($p.bgGreen, $p.br2, $p.pv8, $p.z1)]:
                        props.environment === env,
                    },
                  )}
                >
                  <div
                    className={cx($p.ttu, $p.fw6, $p.f14, {
                      [$p.black30]: props.environment !== env,
                      [$p.white]: props.environment === env,
                    })}
                  >
                    {env}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  </div>

export default Chooser
