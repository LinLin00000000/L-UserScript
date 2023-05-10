import { groupBy } from './utils'

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
