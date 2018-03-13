import * as React from 'react'
import * as _ from 'lodash'
import getDisplayName from 'react-display-name'

/* tslint:disable */
/**
 * Decorator that converts immutable props to plain JS.
 * Optionally, filter which props get converted.
 */
export default function toJS(propsMap) {
  function decorate(component: any) {
    class ToJS extends React.Component {
      static displayName = `ToJS(${getDisplayName(component)})`
      static WrappedComponent = component

      toJS(): any {
        return _.reduce(
          this.props,
          (result, value: any, key) => {
            if (propsMap) {
              if (propsMap[key]) {
                result[propsMap[key]] =
                  typeof value.toJS === 'function' ? value.toJS() : value
              } else {
                result[key] = value
              }
            } else {
              result[key] =
                value && typeof value.toJS === 'function' ? value.toJS() : value
            }
            return result
          },
          {},
        )
      }

      render() {
        return React.createElement(component, this.toJS())
      }
    }
    return ToJS
  }

  // Support `true`.
  if (propsMap === true) {
    propsMap = null
  }

  // Support an array of propNames.
  if (_.isArray(propsMap)) {
    propsMap = _.keyBy(propsMap, _.identity)
  }

  // Support using @toJS or @toJS(propsMap)
  if (_.isPlainObject(propsMap) || !propsMap) {
    return decorate
  } else {
    return decorate.apply(null, arguments)
  }
}
