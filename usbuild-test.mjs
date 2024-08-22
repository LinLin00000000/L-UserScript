import { build } from '../usbuild'
import { createElement1, getValueByString, insertAdjacentHTML, restore, useHook } from './hmr-utils'

await build(
    {
        match: ['https://eylink.cn/'],
    },
    {
        dev: true,
        autoReloadMode: 'reinstall',
    }
)

unsafeWindow.getValueByString = getValueByString
unsafeWindow.cr = createElement1
unsafeWindow.restore = restore

// 创建一个新的元素
const newElement = createElement1('div')
newElement.innerHTML = '这是新添加的元素'

// 将新元素添加到 body 的最前面
document.body.firstChild.before(newElement)
document.body.insertBefore(newElement, document.body.firstChild)

// insertAdjacentHTML.call(document.body, 'beforeend', '<div>这是新添加的元素</div>')
useHook()

// const newElement1 = document.createElement('div')
// newElement1.innerHTML = '这是新添加的元素11'

// document.body.firstChild.before(newElement1)

document.body.firstChild.insertAdjacentHTML('afterbegin', '<div>这是新添加的元素22333</div>')
