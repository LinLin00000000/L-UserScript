import {
  dynamicQuery,
  foreverQuery,
  hideElements,
  mybuild,
  removeAllEventListeners,
} from './utils'
await mybuild(
  {
    match: [
      'http*://www.xsnvshen.co/album/*',
      'http*://www.xsnvshen.com/album/*',
    ],
  },
  {
    dev: false,
    outdir: 'pub',
  }
)
// 创建一个 <style> 元素
const style = document.createElement('style')

// 添加覆盖样式
style.innerHTML = `
    .showlists li {
        width: 100% !important;
        height: auto !important;
        padding: 0 !important;
        border-right: none !important;
        border-bottom: none !important;
        cursor: default !important;
    }

    .swl-item .swi-hd {
        display: block !important;
        width: auto !important;
        height: auto !important;
    }

    .showlists img {
        width: 100% !important;
        max-width: none !important;
        max-height: none !important;
    }
`

// 将样式添加到 <head> 中
document.head.appendChild(style)

// 默认列表模式，可以一次浏览所有图片
dynamicQuery('.workContentWrapper', hideElements)
dynamicQuery('.showlists', e => {
  e.style.display = 'block'
})

// 移除所有图片上的事件监听器
$('.showlists img').off('click')
