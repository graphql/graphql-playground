import * as React from 'react'
import { isImmutable } from 'immutable'
export const toJS = WrappedComponent => wrappedComponentProps => {
  const KEY = 0
  const VALUE = 1
  const propsJS = Object.entries(wrappedComponentProps).reduce(
    (newProps, wrappedComponentProp: any) => {
      newProps[wrappedComponentProp[KEY]] = isImmutable(
        wrappedComponentProp[VALUE],
      )
        ? wrappedComponentProp[VALUE].toJS()
        : wrappedComponentProp[VALUE]
      return newProps
    },
    {},
  )
  return <WrappedComponent {...propsJS} />
}
