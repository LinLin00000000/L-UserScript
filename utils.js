export function getDirname(importMeta) {
    return decodeURI(importMeta.url).split(/[\\/]/).filter(Boolean).at(-2)
}

/**
 * @description Group an array by a function
 * @template T
 * @param {T[]} array
 * @param {(item: T) => boolean} f 将数组中的每一项传入该函数，返回 true 则放入第一个数组，否则放入第二个数组
 * @returns {[T[], T[]]}
 * @example
 * const [trueArray, falseArray] = groupBy([1, 2, 3, 4, 5], item => item % 2 === 0)
 * // trueArray = [2, 4]
 * // falseArray = [1, 3, 5]
 */
export function groupBy(array, f) {
    const trueArray = []
    const falseArray = []
    array.forEach(item => {
        if (f(item)) {
            trueArray.push(item)
        } else {
            falseArray.push(item)
        }
    })
    return [trueArray, falseArray]
}
