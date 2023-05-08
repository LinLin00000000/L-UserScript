// ==UserScript==
// @name         NTDM Helper
// @namespace    Lin
// @version      0.1.0
// @description  Hide some useless elements in NTDM page, make it clean and tidy.
// @author       Lin
// @match        *.ntdm8.com/*
// @match        danmu.yhdmjx.com/*
// @grant        none
// @license      MIT License
// @homepageURL  https://github.com/LinLin00000000/L-UserScript
// ==/UserScript==

;(function () {
    'use strict'

    let selectors = ['#HMRichBox', '[data-balloon="画中画"]']
    const limit = 10
    let count = 0

    const timer = setInterval(() => {
        const [appear, disappear] = groupBy(
            selectors,
            selector => document.querySelectorAll(selector).length > 0
        )
        console.log('appear', appear)
        console.log('disappear', disappear)

        appear.forEach(selector => {
            document
                .querySelectorAll(selector)
                .forEach(node => (node.style.display = 'none'))
        })

        if (disappear.length === 0 || count++ > limit) {
            clearInterval(timer)
        } else {
            selectors = disappear
        }
    }, 1000)
})()

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
function groupBy(array, f) {
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
