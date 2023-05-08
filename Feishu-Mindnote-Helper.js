// ==UserScript==
// @name         Lin's Feishu Mindnote Helper
// @namespace    Lin
// @version      0.1.0
// @description  Hide some useless elements in Feishu Mindnote page, make it clean and tidy.
// @author       Lin
// @match        https://linlin00.feishu.cn/mindnotes/EwaGbXd70mcocjnqRu9cbDO7nOc
// @icon         https://www.google.com/s2/favicons?sz=64&domain=feishu.cn
// @grant        none
// @license      MIT License
// @homepageURL  https://github.com/LinLin00000000/L-UserScript
// ==/UserScript==

;(function () {
    'use strict'

    // Your code here...
    const selectors = [
        '.mindmap',
        '.mindnote-minder-comment',
        '.gpf-biz-help-center__trigger-button-box',
    ]

    const check = () =>
        selectors.every(
            selector => document.querySelectorAll(selector).length > 0
        )

    const action = () =>
        selectors.forEach(selector => {
            document
                .querySelectorAll(selector)
                .forEach(node => (node.hidden = true))
        })

    const timer = setInterval(() => {
        if (check()) {
            action()
            clearInterval(timer)
        }
    }, 1000)
})()
