import { mybuild } from './utils'
await mybuild(
    {
        match: ['https://www.coursera.org/*'],
    },
    {
        // dev: true,
    }
)

// 创建一个新的 style 元素
const style = document.createElement('style')

// 定义你想要添加的 CSS 规则
const css = `video::-webkit-media-text-track-display { 
    // background: rgba(0, 0, 0, 0.2); /* 黑色半透明背景 */
    font-size: 60%; /* 调整字体大小 */
}`

// 针对不同的浏览器，添加 CSS 规则的方法可能略有不同
if (style.styleSheet) {
    // IE 浏览器
    style.styleSheet.cssText = css
} else {
    // 其他浏览器
    style.appendChild(document.createTextNode(css))
}

// 将 style 元素添加到文档的 <head> 中
document.head.appendChild(style)
