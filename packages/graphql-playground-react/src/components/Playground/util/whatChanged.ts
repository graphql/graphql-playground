export function whatChanged(
  oldProps,
  newProps,
  oldState?: any,
  newState?: any,
) {
  return {
    props: getUnequalProps(oldProps, newProps),
    state: oldState && newState ? getUnequalProps(oldState, newState) : null,
  }
}

function getUnequalProps(obj1, obj2) {
  return Object.keys(obj1).filter(key => {
    return obj1[key] !== obj2[key]
  })
}
