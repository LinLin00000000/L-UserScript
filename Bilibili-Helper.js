import { dynamicQuery, mybuild, simulateKeyPress } from './utils'
await mybuild(
  {
    match: ['https://www.bilibili.com/*'],
  },
  {
    // dev: true,
  }
)

// 自动宽屏播放
dynamicQuery('.bpx-player-ctrl-wide', e => e.click())

// 自动去除分享链接中的查询参数
{
  // 保存原始的 clipboard.writeText 函数
  const originalWriteText = navigator.clipboard.writeText

  // 重写 clipboard.writeText 方法
  navigator.clipboard.writeText = function (text) {
    const modifiedText = cleanText(text)

    // 调用原始的 writeText 方法来复制修改后的文本
    return originalWriteText.call(navigator.clipboard, modifiedText)
  }

  function cleanText(text) {
    // 正则表达式匹配开头的【】内的任何内容，紧随其后的bilibili视频链接，并删除链接中的查询参数
    const regex = /^(【.*?】)\s(https:\/\/www\.bilibili\.com\/video\/BV[\w]+).*/
    return text.replace(regex, '$1 $2')
  }
}

dynamicQuery('video', video => {
  // 鼠标中键全屏
  {
    video.addEventListener('mousedown', function (event) {
      if (event.button === 1) {
        fullScreen()
      }
    })

    function fullScreen() {
      dynamicQuery('div[aria-label="全屏"]', e => e.click())
    }
  }

  // 滚轮控制快进快退
  {
    video.addEventListener('wheel', function (event) {
      // 阻止页面的默认滚动行为
      event.preventDefault()
      event.stopPropagation()

      // 检测滚轮的方向
      if (event.deltaY < 0) {
        // 滚轮向上，模拟按键“左”
        simulateKeyPress('ArrowLeft')
      } else if (event.deltaY > 0) {
        // 滚轮向下，模拟按键“右”
        simulateKeyPress('ArrowRight')
      }
    })
  }
})
