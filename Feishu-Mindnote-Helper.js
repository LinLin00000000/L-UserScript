const selectors = [
    '.mindmap',
    '.mindnote-minder-comment',
    '.gpf-biz-help-center__trigger-button-box',
]

const check = () =>
    selectors.every(selector => document.querySelectorAll(selector).length > 0)

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
