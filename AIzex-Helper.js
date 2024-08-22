import {
  dynamicQuery,
  isEmptyString,
  mybuild,
  textQuery,
  onUrlChange,
  listenerWithTimeout,
  extractUniqueHosts,
} from './utils'

const mainPageUrl = 'https://aizex.net/'
const gptPoolUrl = 'https://aizex.net/plusPool'
const gptChatUrl = 'https://linlin.aizex.cn/'
const claudePoolUrl = 'https://aizex.net/proPool'
const claudeChatUrl = 'https://linlin-c.aizex.cn/'

await mybuild(
  {
    match: extractUniqueHosts([
      mainPageUrl,
      gptPoolUrl,
      gptChatUrl,
      claudePoolUrl,
      claudeChatUrl,
    ]),
  },
  {
    dev: false,
  }
)

if (location.href.includes(mainPageUrl)) {
  // Aizex 合租面板

  setTimeout(() => {
    // 如果未登录，首页会有一个登录/注册按钮
    window.a = textQuery('登录/注册')
    if (a.length > 0) {
      a[0].click()
    } else {
      // 这是已登录的情况
      onUrlChange(url => {
        // console.log('URL changed to:', url)
        if (url === gptPoolUrl) {
          // console.log('Executing function...')
          setTimeout(() => {
            window.a = textQuery('Team')
            a[0].click()
            setTimeout(() => {
              location.href = gptChatUrl
            }, 2000)
          }, 1000)
        }
      })
    }
  }, 1000)
} else if (location.pathname !== '/api/auth/session') {
  // 对话页面

  // 如果未登录，则会有一个"登录失效"的文本，这时直接重定向到首页
  setTimeout(() => {
    if (textQuery('登录失效').length > 0) {
      location.href = gptPoolUrl
    }
  }, 2000)

  // 自动选择团队空间
  dynamicQuery(
    '[role="dialog"]',
    e =>
      e.lastElementChild.firstElementChild.firstElementChild.firstElementChild.click(),
    { timeout: 2000 }
  )

  // 检测鼠标在 2s 内是否有移动，如果没有则关闭页面
  // 这个功能还有待商榷
  // listenerWithTimeout(() => window.close(), 2000, 'mousemove')
}
