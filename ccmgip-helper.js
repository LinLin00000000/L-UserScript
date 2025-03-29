import { dynamicQuery, mybuild, simulateKeyPress } from './utils'
await mybuild(
  {
    match: ['https://art.ccmgip.com/*'],
  },
  {
    // dev: true,
  }
)

// 使用localStorage存储滚动位置
const storage = localStorage
const visitedUrls = new Set()

// 辅助函数：格式化时间
function formatTime() {
  return new Date().toLocaleTimeString('en-US', { hour12: false })
}

// 处理URL，生成唯一标识符
function generateUrlKey(url) {
  try {
    const urlObj = new URL(url)
    // 使用完整URL路径作为key，包括search和hash
    return `${urlObj.pathname}${urlObj.search}${urlObj.hash}`
  } catch (e) {
    console.error('URL解析错误:', e)
    return url
  }
}

// 节流函数
function throttle(func, limit) {
  let inThrottle
  let lastSavedPosition = 0
  let lastUrlKey = ''

  return function () {
    const currentPosition = Math.round(
      window.pageYOffset || document.documentElement.scrollTop
    )
    const currentUrl = window.location.href
    const currentUrlKey = generateUrlKey(currentUrl)

    if (
      !inThrottle &&
      (Math.abs(currentPosition - lastSavedPosition) > 100 ||
        currentUrlKey !== lastUrlKey)
    ) {
      if (currentPosition > 0) {
        console.log(
          `[${formatTime()}] 触发保存条件 - 位置差异: ${Math.abs(currentPosition - lastSavedPosition)}, URL变化: ${currentUrlKey !== lastUrlKey}`
        )
        func(currentUrl, currentPosition)
        lastSavedPosition = currentPosition
        lastUrlKey = currentUrlKey
        inThrottle = true
        setTimeout(() => {
          inThrottle = false
          console.log(`[${formatTime()}] 节流结束，可以进行下一次保存`)
        }, limit)
      }
    }
  }
}

// 保存页面滚动位置
function saveScrollPosition(url, position) {
  if (!url || typeof url !== 'string') {
    url = window.location.href
  }
  if (typeof position !== 'number') {
    position = Math.round(
      window.pageYOffset || document.documentElement.scrollTop
    )
  }

  try {
    if (position > 0) {
      const urlKey = generateUrlKey(url)
      if (!urlKey) {
        console.error('无效的URL Key')
        return
      }

      const storageKey = 'scrollPos_' + urlKey
      const oldPosition = parseInt(storage.getItem(storageKey)) || 0
      const now = Date.now()

      // 只在位置显著变化时更新
      if (Math.abs(position - oldPosition) > 10) {
        visitedUrls.add(urlKey)
        storage.setItem(storageKey, position)
        storage.setItem(`${storageKey}_timestamp`, now)

        console.log(
          `[${formatTime()}] 保存滚动位置: ${position} -> ${urlKey}${oldPosition ? ' (原位置: ' + oldPosition + ')' : ''}`
        )
      }
    }
  } catch (error) {
    console.error('保存滚动位置时出错:', error)
  }
}

// 恢复页面滚动位置
function restoreScrollPosition(url = window.location.href) {
  try {
    const urlKey = generateUrlKey(url)
    const storageKey = 'scrollPos_' + urlKey
    const scrollPos = storage.getItem(storageKey)
    const timestamp = storage.getItem(`${storageKey}_timestamp`)

    console.log(
      `[${formatTime()}] 尝试恢复位置 - URLKey: ${urlKey}, 存储位置: ${scrollPos}`
    )

    // 检查是否访问过该URL并且存在保存的位置
    if (scrollPos && visitedUrls.has(urlKey)) {
      const targetPos = parseInt(scrollPos)
      if (targetPos > 0) {
        console.log(
          `[${formatTime()}] 开始恢复滚动位置: ${targetPos}, 文档状态: ${document.readyState}`
        )
        if (document.readyState === 'complete') {
          performScroll(targetPos)
        } else {
          console.log(`[${formatTime()}] 页面未完全加载，等待load事件`)
          window.addEventListener(
            'load',
            () => {
              console.log(`[${formatTime()}] 页面加载完成，现在恢复位置`)
              performScroll(targetPos)
            },
            { once: true }
          )
        }
      }
    } else {
      console.log(`[${formatTime()}] 未找到URL的存储位置或未访问过: ${urlKey}`)
    }
  } catch (error) {
    console.error('恢复滚动位置时出错:', error)
  }
}

let scrollAttemptTimer = null

function performScroll(targetPos) {
  if (targetPos <= 0) {
    console.log(`[${formatTime()}] 跳过滚动：目标位置 <= 0`)
    return
  }

  // 清理之前的滚动尝试
  if (scrollAttemptTimer) {
    clearTimeout(scrollAttemptTimer)
  }

  let attempts = 0
  const maxAttempts = 10 // 最大重试次数
  const initialDelay = 300 // 首次尝试延迟
  const retryDelay = 500 // 重试间隔

  function attemptScroll() {
    const currentPos = Math.round(
      window.pageYOffset || document.documentElement.scrollTop
    )
    const documentHeight = Math.max(
      document.documentElement.scrollHeight,
      document.documentElement.clientHeight
    )

    // 检查页面是否有足够的高度可以滚动
    if (documentHeight < targetPos + 100) {
      if (attempts < maxAttempts) {
        attempts++
        console.log(
          `[${formatTime()}] 等待内容加载... (当前高度=${documentHeight}, 目标=${targetPos}), 重试 ${attempts}/${maxAttempts}`
        )
        scrollAttemptTimer = setTimeout(attemptScroll, retryDelay)
        return
      }
    }

    // 尝试滚动
    window.scrollTo({
      top: targetPos,
      behavior: 'auto',
    })

    // 验证滚动结果
    setTimeout(() => {
      const finalPos = Math.round(
        window.pageYOffset || document.documentElement.scrollTop
      )
      const positionDiff = Math.abs(finalPos - targetPos)

      if (positionDiff > 50 && attempts < maxAttempts) {
        attempts++
        console.log(
          `[${formatTime()}] 位置未对齐 (当前=${finalPos}, 目标=${targetPos}), 重试 ${attempts}/${maxAttempts}`
        )
        scrollAttemptTimer = setTimeout(attemptScroll, retryDelay)
      } else {
        const success = positionDiff <= 50
        console.log(
          `[${formatTime()}] 滚动${success ? '成功' : '失败'}: 目标=${targetPos}, 最终=${finalPos}`
        )

        // 更新状态
        isRestoring = false
        if (currentRestoreTimer) {
          clearTimeout(currentRestoreTimer)
          currentRestoreTimer = null
        }
      }
    }, 100)
  }

  // 开始第一次滚动尝试
  setTimeout(attemptScroll, initialDelay)
}

// 处理导航事件前保存位置
// 保存上一个页面的完整URL key用于比较
let lastUrlKey = generateUrlKey(window.location.href)

function handlePreNavigation(trigger = 'unknown') {
  const currentUrl = window.location.href
  const currentPos = Math.round(
    window.pageYOffset || document.documentElement.scrollTop
  )
  const currentUrlKey = generateUrlKey(currentUrl)
  console.log(
    `[${formatTime()}] 导航事件触发 [${trigger}] - 当前位置: ${currentPos}, URLKey: ${currentUrlKey}`
  )

  // 如果是新的导航路径，保存当前位置并准备新页面
  if (currentUrlKey !== lastUrlKey) {
    console.log(
      `[${formatTime()}] 检测到URL变化: ${lastUrlKey} -> ${currentUrlKey}`
    )

    // 保存当前页面的位置
    if (currentPos > 0) {
      const currentKey = 'scrollPos_' + lastUrlKey
      storage.setItem(currentKey, currentPos)
      storage.setItem(`${currentKey}_timestamp`, Date.now())
      visitedUrls.add(lastUrlKey)
      console.log(
        `[${formatTime()}] 已保存当前页面位置: ${lastUrlKey} -> ${currentPos}`
      )
    }

    // 更新状态
    lastUrlKey = currentUrlKey
    isRestoring = false
    lastNavigationTime = Date.now()

    // 清除计时器
    if (currentRestoreTimer) {
      clearTimeout(currentRestoreTimer)
      currentRestoreTimer = null
    }
    if (scrollAttemptTimer) {
      clearTimeout(scrollAttemptTimer)
      scrollAttemptTimer = null
    }

    return // 结束当前处理
  }

  // 只有在同一页面内才保存滚动位置
  if (currentPos > 0) {
    saveScrollPosition(currentUrl, currentPos)
  }
}

// 页面加载完成后恢复位置
window.addEventListener('load', () => {
  console.log(`[${formatTime()}] 页面加载完成，准备恢复位置`)
  scheduleRestore('load')
})

// 用户离开页面前保存位置
window.addEventListener('beforeunload', () =>
  handlePreNavigation('beforeunload')
)

// 用于跟踪短时间内的导航事件
let lastNavigationTime = 0

// 跟踪当前恢复操作
let isRestoring = false
let currentRestoreTimer = null

// 统一的恢复位置函数
function scheduleRestore(trigger) {
  if (isRestoring) {
    console.log(
      `[${formatTime()}] 已有恢复操作在进行中，跳过 (触发器: ${trigger})`
    )
    return
  }

  isRestoring = true
  if (currentRestoreTimer) {
    clearTimeout(currentRestoreTimer)
  }

  currentRestoreTimer = setTimeout(() => {
    console.log(`[${formatTime()}] 开始恢复位置操作 (触发器: ${trigger})`)
    restoreScrollPosition()
    isRestoring = false
    currentRestoreTimer = null
  }, 300)
}

// 监听浏览器的前进/后退按钮
window.addEventListener('popstate', () => {
  const now = Date.now()
  handlePreNavigation('popstate')
  lastNavigationTime = now
  scheduleRestore('popstate')
})

// 重写 history 方法
const originalPushState = history.pushState
const originalReplaceState = history.replaceState

history.pushState = function (...args) {
  const now = Date.now()
  handlePreNavigation('pushState')
  lastNavigationTime = now
  originalPushState.apply(this, args)
  scheduleRestore('pushState')
}

history.replaceState = function (...args) {
  const now = Date.now()
  handlePreNavigation('replaceState')
  lastNavigationTime = now
  originalReplaceState.apply(this, args)
  scheduleRestore('replaceState')
}

// 监听链接点击
document.addEventListener(
  'click',
  function (e) {
    const link = e.target.closest('a')
    if (link && link.href) {
      handlePreNavigation('click')
    }
  },
  true
)

// 监听滚动事件
window.addEventListener('scroll', throttle(saveScrollPosition, 500), {
  passive: true,
})

// 清理存储，防止无限增长
function cleanupStorage() {
  try {
    const maxEntries = 100
    const urlPrefix = 'scrollPos_'
    const now = Date.now()
    const maxAge = 24 * 60 * 60 * 1000 // 24小时

    let urls = []
    let cleaned = 0
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i)
      if (key && key.startsWith(urlPrefix) && !key.endsWith('_timestamp')) {
        const timestamp = parseInt(storage.getItem(`${key}_timestamp`)) || 0
        if (now - timestamp > maxAge) {
          storage.removeItem(key)
          storage.removeItem(`${key}_timestamp`)
          const urlKey = key.replace(urlPrefix, '')
          visitedUrls.delete(urlKey)
          cleaned++
          continue
        }
        urls.push({ key, time: timestamp })
      }
    }

    if (cleaned > 0) {
      console.log(`[${formatTime()}] 清理了 ${cleaned} 条过期记录`)
    }

    if (urls.length > maxEntries) {
      urls.sort((a, b) => b.time - a.time)
      const toRemove = urls.slice(maxEntries)
      toRemove.forEach(item => {
        storage.removeItem(item.key)
        storage.removeItem(`${item.key}_timestamp`)
        const urlKey = item.key.replace(urlPrefix, '')
        visitedUrls.delete(urlKey)
      })
      console.log(`[${formatTime()}] 清理了 ${toRemove.length} 条超额记录`)
    }
  } catch (error) {
    console.error('清理存储时出错:', error)
  }
}

// 定期清理存储
const cleanupInterval = setInterval(cleanupStorage, 1000 * 60 * 5)

// 页面卸载时清理定时器
window.addEventListener('unload', () => {
  clearInterval(cleanupInterval)
  if (currentRestoreTimer) {
    clearTimeout(currentRestoreTimer)
  }
  if (scrollAttemptTimer) {
    clearTimeout(scrollAttemptTimer)
  }
})

// 启动时恢复已访问的URL集合和清理过期记录
console.log(`[${formatTime()}] 脚本启动，开始恢复记录...`)
const now = Date.now()
const maxAge = 24 * 60 * 60 * 1000 // 24小时

for (let i = 0; i < storage.length; i++) {
  const key = storage.key(i)
  if (key && key.startsWith('scrollPos_') && !key.endsWith('_timestamp')) {
    const urlKey = key.replace('scrollPos_', '')
    const timestamp = parseInt(storage.getItem(`${key}_timestamp`)) || 0
    const position = parseInt(storage.getItem(key)) || 0

    // 检查记录是否过期
    if (now - timestamp > maxAge || position <= 0) {
      storage.removeItem(key)
      storage.removeItem(`${key}_timestamp`)
      console.log(`[${formatTime()}] 清理过期记录: ${urlKey}`)
    } else {
      visitedUrls.add(urlKey)
      console.log(`[${formatTime()}] 恢复记录: ${urlKey} -> ${position}`)
    }
  }
}

console.log(`[${formatTime()}] 记录恢复完成，共 ${visitedUrls.size} 条有效记录`)
