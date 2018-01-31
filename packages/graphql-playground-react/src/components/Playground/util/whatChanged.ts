export function whatChanged(oldProps, newProps, oldState, newState) {
  return {
    props: getUnequalProps(oldProps, newProps),
    state: getUnequalProps(oldState, newState),
  }
}

function getUnequalProps(obj1, obj2) {
  return Object.keys(obj1).filter(key => {
    return obj1[key] !== obj2[key]
  })
}
