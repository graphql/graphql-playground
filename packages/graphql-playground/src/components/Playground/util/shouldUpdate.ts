// import { pick } from 'lodash'
//
// const cache: any = {}
//
// // TODO remove
// export default function shouldUpdate(
//   name: string | null,
//   instance,
//   nextProps,
//   nextState,
// ) {
//   const { props } = instance
//   let fields: any[] = []
//
//   if (name && cache[name]) {
//     fields = cache[name]
//   }
//
//   if ((name && !cache[name]) || !name) {
//     fields = Object.keys(props).filter(k => typeof props[k] !== 'function')
//
//     if (name) {
//       cache[name] = fields
//     }
//   }
//
//   const oldProps = pick(props, fields)
//   const newProps = pick(nextProps, fields)
//
//   const propsEqual = shallowEqual(oldProps, newProps)
//   const stateEqual = shallowEqual(instance.state, nextState)
//
//   return !propsEqual && !stateEqual
// }
//
// const hasOwnProperty = Object.prototype.hasOwnProperty
//
// function is(x, y) {
//   // SameValue algorithm
//   if (x === y) {
//     // Steps 1-5, 7-10
//     // Steps 6.b-6.e: +0 != -0
//     // Added the nonzero y check to make Flow happy, but it is redundant
//     return x !== 0 || y !== 0 || 1 / x === 1 / y
//   } else {
//     // Step 6.a: NaN == NaN
//     return x !== x && y !== y
//   }
// }
//
// /**
//  * Performs equality by iterating through keys on an object and returning false
//  * when any key has values which are not strictly equal between the arguments.
//  * Returns true when the values of all keys are strictly equal.
//  */
// function shallowEqual(objA, objB) {
//   if (is(objA, objB)) {
//     return true
//   }
//
//   if (
//     typeof objA !== 'object' ||
//     objA === null ||
//     typeof objB !== 'object' ||
//     objB === null
//   ) {
//     return false
//   }
//
//   const keysA = Object.keys(objA)
//   const keysB = Object.keys(objB)
//
//   if (keysA.length !== keysB.length) {
//     return false
//   }
//
//   // Test for A's keys different from B.
//   for (const key of keysA) {
//     if (!hasOwnProperty.call(objB, key) || !is(objA[key], objB[key])) {
//       return false
//     }
//   }
//
//   return true
// }
