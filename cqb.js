import { foreverQuery, mybuild, sleep, waitForElements } from './utils'

await mybuild(
  {
    match: ['https://*.ccmgip.com/*'],
    version: '0.1.0',
  },
  {
    dev: false,
    outdir: 'pub',
  }
)

globalThis.f = (s, d) =>
  [...s]
    .map(e => (e !== '0' ? parseInt(e) : 11))
    .forEach(i => {
      if (d && d.children[i - 1]) {
        d.children[i - 1].click()
      } else {
        console.error('未找到元素 d 或其子元素，索引：', i)
      }
    })

const debounce = (func, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}

globalThis.qb = async () => {
  console.log('执行 qb，开始查找元素...')
  try {
    const elements = await waitForElements('[class^="_items"]')
    console.log(`waitForElements 找到 ${elements.length} 个元素。`)
    const d = elements.at(-1)
    console.log('找到 d:', d)
    if (d) {
      f('000000', d)
      console.log('qb：已在元素 d 上执行 f 函数。')
    } else {
      console.error('qb：未找到目标元素 d (最后一个匹配 [class^="_items"] 的元素)。')
    }
  } catch (error) {
    console.error('qb：执行 waitForElements 或后续操作时出错:', error)
  }
}

const qbDebounceDelay = 500
const debouncedQb = debounce(qb, qbDebounceDelay)

// 设置元素 b 的观察器函数 - 重命名为 startPolling
const startPolling = () => {
  console.log('开始轮询检查元素 b...')
  let isKeyboardVisible = false // 跟踪键盘可见状态

  const checkElementB = async () => {
    const b = [...document.querySelectorAll('[class^="_keyboard"]')].at(-1)
    const currentlyVisible = b && b.style.display === 'block'

    if (currentlyVisible && !isKeyboardVisible) {
      console.log('轮询检查：元素 b 变为可见 (display: block)。触发 debouncedQb...')
      debouncedQb()
      isKeyboardVisible = true
    } else if (!currentlyVisible && isKeyboardVisible) {
      console.log('轮询检查：元素 b 变为不可见。')
      isKeyboardVisible = false
      // 可选：如果需要在键盘消失时取消挂起的 qb，可以在这里清除 debounce 定时器
      // clearTimeout(debouncedQb.timeoutId); // 注意：需要修改 debounce 函数以暴露 timeoutId
    }
    // 如果 currentlyVisible 和 isKeyboardVisible 都为 true，则不执行任何操作，避免重复触发
  }

  setInterval(checkElementB, qbDebounceDelay) // 保持轮询间隔
}

startPolling()

foreverQuery('._active_1yyur_328, ._jumpBtn_9mtdp_191', e => {
  if (e.isProcessed) return
  e.isProcessed = true
  e.click()
})
