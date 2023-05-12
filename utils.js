import path from 'path'

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

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * @param {string} fileName
 * @returns {string}
 */
export function processFileName(fileName) {
    return path.basename(fileName).replaceAll('-', ' ').replace('.js', '')
}

/**
 * @description 逐步查询，直到所有选择器都找到了元素
 * @param {string[]} selectors
 * @param {(element: Element) => void} callback
 * @param {number} [interval=1000]
 * @param {number} [limit=10]
 * @returns {void}
 * @example
 * progressiveQuery(
 *    ['.mindmap', '.mindnote-minder-comment'],
 *    element => {element.style.display = 'none'}
 *  }
 * )
 */
export function progressiveQuery(
    selectors,
    callback,
    interval = 1000,
    limit = 10
) {
    let count = 0
    const timer = setInterval(() => {
        const [appear, disappear] = groupBy(
            selectors,
            selector => document.querySelectorAll(selector).length > 0
        )

        appear.forEach(selector => {
            document.querySelectorAll(selector).forEach(callback)
        })

        if (disappear.length === 0 || count++ > limit) {
            clearInterval(timer)
        } else {
            selectors = disappear
        }
    }, interval)
}

/**
 * @param {Element} element
 */
export function hideElements(element) {
    element.style.display = 'none'
}

/**
 * 设置跨域信息
 * @param {String} message 跨域信息
 */
export function setCrossMessage(message, iframeSelector) {
    const iframe = document.querySelector(iframeSelector)
    iframe.src = iframe.src + '#' + message
    // window.name = message
}

export function initCrossMessage() {
    window.onhashchange = () => {
        console.log(`window.location.hash: ${window.location.hash}`)
        window._mes = window.location.hash
    }
}

/**
 * 获取跨域传递的信息
 * @return {string} 跨域传递的信息
 */
export function getCrossMessage() {
    return window._mes
}
