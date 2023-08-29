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
 * @description 逐步查询，直到所有选择器都找到了元素
 * @param {string[] | string} selector
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
    selector,
    callback,
    interval = 300,
    limit = 20
) {
    let count = 0
    let selectors = Array.isArray(selector) ? selector : [selector]
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
 * @typedef {Object} MessageEmitter
 * @property {(listener: (message: string) => void) => void} addListener
 * @property {(message: string) => void} emitMessage
 */

/**
 * @param {'parent' | 'child'} identity
 * @param {string} [options.trustedOrigin='*'] 仅 parent 需要配置
 * @param {string} [options.targetSelector='#iframe'] 仅 parent 需要配置
 * @param {string} [options.targetOrigin='*'] 仅 child 需要配置
 * @returns {MessageEmitter}
 */
export function initMessageEmitter(
    identity,
    { trustedOrigin = '*', targetSelector = '#iframe', targetOrigin = '*' } = {}
) {
    switch (identity) {
        case 'parent':
            return {
                addListener(listener) {
                    window.addEventListener('message', e => {
                        if (
                            trustedOrigin === '*' ||
                            e.origin === trustedOrigin
                        ) {
                            listener(e.data, e)
                        }
                    })
                },
                emitMessage(message) {
                    const iframe = document.querySelector(targetSelector)
                    if (iframe) {
                        iframe.src = iframe.src + '#' + message
                    }
                },
            }
        case 'child':
            return {
                addListener(listener) {
                    window.addEventListener('hashchange', e => {
                        listener(window.location.hash.slice(1), e)
                    })
                },
                emitMessage(message) {
                    window.parent.postMessage(message, targetOrigin)
                },
            }
    }
}

/**
 * @param {{[key: string]: string | string[]}} config
 * @param {string[]} [blacklist]
 * @param {string} [separator]
 * @param {number} [spaceNum]
 * @returns {string}
 */
export function bannerBuilder(
    config,
    blacklist = ['skip', 'fileName'],
    separator = '\n',
    spaceNum = 2
) {
    const config1 = Object.fromEntries(
        Object.entries(config).filter(([key]) => !blacklist.includes(key))
    )
    const maxLen = Object.keys(config1).reduce(
        (acc, key) => (acc > key.length ? acc : key.length),
        0
    )
    const fields = Object.entries(config1).map(([key, value]) => {
        const space = ' '.repeat(maxLen - key.length + spaceNum)
        const keyString = `// @${key}${space}`
        return Array.isArray(value)
            ? value.map(e => keyString + e).join(separator)
            : keyString + value
    })

    const header = `// ==UserScript==`
    const footer = `// ==/UserScript==`
    return [header, ...fields, footer].join(separator)
}

export function isNil(value) {
    return value === undefined || value === null
}

export function isEmptyString(str) {
    return isNil(str) || str === ''
}

/**
 * 获取文件的扩展名
 * @param {string} fileName 文件名
 * @returns {string} 文件扩展名
 */
export function getFileExtension(fileName) {
    const index = fileName.lastIndexOf('.')
    return index === -1 ? '' : fileName.substring(index + 1)
}

/**
 * Modify file extension
 *
 * @param {string} fileName
 * @param {string} [newExtension='']
 * @returns {string}
 */
export function modifyFileExtension(fileName, newExtension = '') {
    if (!isEmptyString(newExtension) && !newExtension.startsWith('.')) {
        newExtension = '.' + newExtension
    }
    const index = fileName.lastIndexOf('.')
    return index === -1
        ? fileName + newExtension
        : fileName.substring(0, index) + newExtension
}
