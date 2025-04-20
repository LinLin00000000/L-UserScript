export * from './dynamicQuery'
import { build } from '../usbuild'

// Declare Greasemonkey/Tampermonkey functions for TypeScript
declare global {
  function GM_getValue(key: string, defaultValue?: any): any
  function GM_setValue(key: string, value: any): void
  const unsafeWindow: Window & typeof globalThis
}

/**
 * @description Group an array by a function
 * @template T
 * @param {T[]} array 源数组
 * @param {(item: T) => boolean} f 将数组中的每一项传入该函数，返回 true 则放入第一个数组，否则放入第二个数组
 * @returns {[T[], T[]]} 二元组
 * @example
 * const [trueArray, falseArray] = groupBy([1, 2, 3, 4, 5], item => item % 2 === 0)
 * // trueArray = [2, 4]
 * // falseArray = [1, 3, 5]
 */
export function groupBy<T>(array: T[], f: (item: T) => boolean): [T[], T[]] {
  const trueArray: T[] = []
  const falseArray: T[] = []
  array.forEach(item => {
    ;(f(item) ? trueArray : falseArray).push(item)
  })
  return [trueArray, falseArray]
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * @description 仅隐藏元素, 它仍然存在于 DOM 树中
 */
export function hideElements(element: ElementCSSInlineStyle) {
  element.style.display = 'none'
}

/**
 * @description 从 DOM 中完全移除元素
 */
export function removeElement(element: ChildNode) {
  element.remove()
}

export function CSSJustifyCenter(element: ElementCSSInlineStyle) {
  element.style['justify-content'] = 'center'
}

// See https://bbs.tampermonkey.net.cn/thread-2895-1-1.html
export function addMessageListener(
  listener,
  trustedOrigin?: string | string[]
) {
  const trustedOrigins = Array.isArray(trustedOrigin)
    ? trustedOrigin
    : [trustedOrigin]
  window.addEventListener('message', e => {
    if (trustedOrigin === undefined || trustedOrigins.includes(e.origin)) {
      listener(e.data, e)
    }
  })
}

export function send(message: string, options: any = {}) {
  const {
    targetwindow,
    windowProperty = 'parent',
    iframeSelector,
    targetOrigin = '*',
    transfer,
  } = options

  // 默认使用 window.parent 作为 targetWindow
  const finalTargetWindow: Window | undefined =
    targetwindow ??
    (iframeSelector
      ? document.querySelector(iframeSelector)?.contentWindow
      : window[windowProperty])

  if (finalTargetWindow?.postMessage) {
    finalTargetWindow.postMessage(message, targetOrigin, transfer)
  } else {
    console.error('postMessage Error!')
  }
}

export function isNil(value) {
  return value === null || typeof value === 'undefined'
}

export function isEmptyString(str) {
  return isNil(str) || str === ''
}

/**
 *  @description 根据当前页面的路径，判断是否执行 f 函数
 */
export function switchPath(path: string, f: () => void) {
  if (path.startsWith('/')) {
    console.error('path should not start with /')
    return
  }
  if (window.location.pathname.split('/')[1].trim() === path) {
    f()
  }
}

export const globalConfig = {
  namespace: 'L-UserScript',
  version: '0.1.0',
  author: 'Lin',
  license: 'MIT License',
  source: 'https://github.com/LinLin00000000/L-UserScript',
  description: "Lin's userscript. 喵~",
}

export function mybuild(...args: Parameters<typeof build>) {
  return build(
    {
      ...globalConfig,
      ...args[0],
    },
    args[1]
  )
}

export function addClass(e: Element, cs: string) {
  cs.split(' ').forEach(c => e.classList.add(c))
}

export function textQuery(text: string): HTMLElement[] {
  // 创建一个 XPath 表达式来查找包含指定文本的元素
  const xpath = `//*[contains(text(), '${text}')]`

  // 使用 document.evaluate 执行 XPath 表达式
  const result = document.evaluate(
    xpath,
    document,
    null,
    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
    null
  )

  // 创建一个数组来存储找到的所有元素
  const elements: HTMLElement[] = []
  for (let i = 0; i < result.snapshotLength; i++) {
    const elem = result.snapshotItem(i)
    if (elem instanceof HTMLElement) {
      elements.push(elem)
    }
  }

  return elements
}

export function onUrlChange(callback: (arg0: string) => void) {
  // 初始调用，检查当前 URL 是否符合条件
  callback(window.location.href)

  // 监听 `popstate` 事件
  window.addEventListener('popstate', () => {
    callback(window.location.href)
  })

  // 覆盖 `pushState` 和 `replaceState` 方法，以便监听 URL 变化
  const originalPushState = history.pushState
  const originalReplaceState = history.replaceState

  history.pushState = function () {
    originalPushState.apply(history, arguments)
    callback(window.location.href)
  }

  history.replaceState = function () {
    originalReplaceState.apply(history, arguments)
    callback(window.location.href)
  }
}

export function listenerWithTimeout(
  timeoutCallback: () => void,
  timeoutDuration: number,
  eventName: Parameters<typeof window.addEventListener>[0],
  options: Parameters<typeof window.addEventListener>[2] = { once: true }
): void {
  let timer = setTimeout(timeoutCallback, timeoutDuration)

  window.addEventListener(
    eventName,
    () => {
      clearTimeout(timer)
    },
    options
  )
}

/**
 * 从给定的 URL 数组中提取唯一的主机名，并为每个主机名添加 "/*" 后缀
 * @param urls - 要处理的 URL 数组
 * @returns 唯一主机名数组，每个都以 "/*" 结尾
 */
export function extractUniqueHosts(urls: string[]): string[] {
  const uniqueHosts = new Set<string>()

  for (const url of urls) {
    try {
      const parsedUrl = new URL(url)
      uniqueHosts.add(parsedUrl.host)
    } catch (error) {
      console.error(`Invalid URL: ${url}`)
    }
  }

  return Array.from(uniqueHosts).map(host => `${host}/*`)
}

export function removeAllEventListeners(element) {
  // 检查 element 是否存在父节点
  if (element && element.parentNode) {
    // 克隆当前元素
    const clonedElement = element.cloneNode(true)
    // 用克隆后的元素替换原来的元素
    element.parentNode.replaceChild(clonedElement, element)
    return clonedElement // 返回克隆后的元素
  } else {
    console.warn('The element does not have a parent node or is null.')
    return null
  }
}

export function simulateKeyPress(key: string) {
  // 键值和 keyCode 的映射表
  const keyToKeyCode = {
    ArrowLeft: 37,
    ArrowRight: 39,
    Enter: 13,
    // 可以根据需要继续添加更多键值对
  }

  // 如果找不到对应的 keyCode，则抛出错误
  if (!(key in keyToKeyCode)) {
    console.error(`Unsupported key: ${key}`)
    return
  }

  // 模拟键盘事件的函数，减少重复代码
  function dispatchKeyEvent(type: string) {
    const event = new KeyboardEvent(type, {
      key: key,
      code: key,
      keyCode: keyToKeyCode[key],
      // which: keyToKeyCode[key],
      bubbles: true,
      cancelable: true,
    })
    document.dispatchEvent(event)
  }

  // 触发 keydown 和 keyup 事件
  dispatchKeyEvent('keydown')
  dispatchKeyEvent('keyup')
}

/**
 * 等待页面元素加载完成。
 * @param {string} selector CSS 选择器。
 * @param {number} [maxTries=10] 最大尝试次数。
 * @param {number} [interval=1000] 检查间隔时间（毫秒）。
 * @returns {Promise<Element[]>} 一个 Promise，在找到元素时解析为 Element[]，达到最大尝试次数则拒绝。
 */
export function waitForElements(
  selector: string,
  maxTries = 20,
  interval = 500
): Promise<Element[]> {
  return new Promise((resolve, reject) => {
    let tries = 0
    const checkExist = setInterval(() => {
      const elementsNodeList = document.querySelectorAll<Element>(selector)
      tries++
      if (elementsNodeList.length > 0) {
        clearInterval(checkExist)
        resolve(Array.from(elementsNodeList)) // Convert NodeList to Array
      } else if (tries >= maxTries) {
        clearInterval(checkExist)
        console.log('Element not found after max tries: ' + selector)
        reject(new Error('Element not found: ' + selector))
      }
    }, interval)
  })
}

/**
 * 等待一个嵌套的对象属性存在且不为 null/undefined (使用 setInterval)。
 * @param {string} pathString 点分隔的对象路径 (例如 "a.b.c")。
 * @param {object} [options] 配置选项。
 * @param {object} [options.parent=globalThis] 开始查找的父对象，默认为全局作用域 (window/globalThis)。
 * @param {number} [options.maxTries=100] 最大尝试次数。设置为 0 或负数表示无限次尝试。
 * @param {number} [options.interval=100] 检查间隔时间（毫秒）。
 * @param {boolean} [options.requireNonEmptyArray=true] 如果目标对象是数组，是否要求其不为空。
 * @returns {Promise<any>} 一个 Promise，在找到满足条件的对象时解析为该对象，达到最大尝试次数则拒绝。
 */
export function waitForObject(
  pathString: string,
  options: {
    parent?: object
    maxTries?: number
    interval?: number
    requireNonEmptyArray?: boolean
  } = {}
): Promise<any> {
  const {
    parent = globalThis, // Default to globalThis if not provided
    maxTries = 100,
    interval = 100,
    requireNonEmptyArray = false,
  } = options

  return new Promise((resolve, reject) => {
    const pathParts = pathString.split('.')
    let tries = 0
    let intervalHandle: ReturnType<typeof setInterval> | undefined = undefined

    const clearTimers = () => clearInterval(intervalHandle)

    const check = () => {
      tries++
      let current = parent // 从指定的 parent 对象开始查找
      let exists = true
      for (const part of pathParts) {
        if (isNil(current) || isNil(current[part])) {
          exists = false
          break
        }
        current = current[part]
      }

      if (exists) {
        // 检查是否需要非空数组
        if (
          requireNonEmptyArray &&
          Array.isArray(current) &&
          current.length === 0
        ) {
          // 是数组但为空，且要求非空，则继续等待（如果未达到最大尝试次数）
        } else {
          // 对象存在且满足所有条件
          clearTimers()
          resolve(current) // 解析 Promise
          return // 成功找到，退出检查
        }
      }

      // 检查是否达到最大尝试次数 (仅当 maxTries > 0 时)
      if (maxTries > 0 && tries >= maxTries) {
        console.error(
          `waitForObject: Failed to find object "${pathString}" after ${maxTries} tries.`
        )
        clearTimers() // 停止轮询
        reject(new Error(`Max tries reached waiting for object: ${pathString}`))
      }
      // 如果对象未找到或未满足条件，并且未达到最大尝试次数，setInterval 会在下一个间隔后再次调用 check
    }

    // 开始轮询
    intervalHandle = setInterval(check, interval)
    check() // 立即执行一次检查，避免首次等待 interval
  })
}

export function useStore(key: string, defaultValue = null) {
  // 检查 GM 函数是否存在
  if (
    typeof GM_getValue !== 'undefined' &&
    typeof GM_setValue !== 'undefined'
  ) {
    // 油猴环境
    console.log(`检测到油猴环境，键 '${key}' 将使用 GM 函数持久化。`)
    const store = {
      get value() {
        return GM_getValue(key, defaultValue)
      },
      set value(newValue) {
        GM_setValue(key, newValue)
      },
    }
    return store
  } else if (typeof localStorage !== 'undefined') {
    // 非油猴环境，尝试使用 localStorage
    console.warn(`未检测到 GM 函数，键 '${key}' 将尝试使用 localStorage。`)
    const store = {
      get value() {
        const storedValue = localStorage.getItem(key)
        if (storedValue === null) {
          return defaultValue
        }
        try {
          // 尝试解析 JSON，因为 localStorage 只能存字符串
          return JSON.parse(storedValue)
        } catch (e) {
          // 如果解析失败，可能存的是普通字符串
          console.error(`读取键 '${key}' 的 localStorage 值失败，解析错误：`, e)
          return storedValue // 或者返回 defaultValue
        }
      },
      set value(newValue) {
        try {
          localStorage.setItem(key, JSON.stringify(newValue))
        } catch (e) {
          console.error(`写入键 '${key}' 到 localStorage 时出错：`, e)
        }
      },
    }
    return store
  } else {
    // GM 函数和 localStorage 都不可用
    console.error('警告：GM 函数和 localStorage 均不可用，数据将无法持久化！')
    // 提供一个内存中的回退，但数据不会持久化
    let inMemoryValue = defaultValue
    return {
      get value() {
        console.warn(`存储不可用，键 '${key}' 读取的是内存中的临时值。`)
        return inMemoryValue
      },
      set value(newValue) {
        console.warn(
          `存储不可用，键 '${key}' 的值仅保存在内存中，刷新后将丢失。`
        )
        inMemoryValue = newValue
      },
    }
  }
}

/**
 * 监听指定 URL 的 fetch 和 XMLHttpRequest 请求。
 * @param {string} targetBaseUrl 要监听的基础 URL (不包含查询参数)。
 * @param {object} callbacks 回调函数对象。
 * @param {function(object): void} [callbacks.onRequest] 请求发起时的回调。参数: { url: string, method?: string, headers?: Headers | object, body?: any, type: 'fetch' | 'xhr' }
 * @param {function(object): void} [callbacks.onResponse] 成功收到响应时的回调。参数: { data: any, response: Response | XMLHttpRequest, type: 'fetch' | 'xhr' }
 * @param {function(object): void} [callbacks.onError] 请求或处理响应出错时的回调。参数: { error: any, requestInfo: object, type: 'fetch' | 'xhr' }
 */
export function monitorApiRequests(targetBaseUrl: string, callbacks: { onRequest?: (arg0: object) => void; onResponse?: (arg0: object) => void; onError?: (arg0: object) => void } = {}) {
  const { onRequest, onResponse, onError } = callbacks

  // Helper function to get the base URL (without query parameters)
  const getBaseUrl = (fullUrl: string): string => {
    try {
      const urlObj = new URL(fullUrl, window.location.origin) // Provide a base if the URL is relative
      return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`
    } catch (e) {
      // Handle cases where the URL might be invalid or relative in a way URL constructor doesn't like
      // For simple cases, just split by '?'
      return fullUrl.split('?')[0]
    }
  }

  // --- 监听 Fetch ---
  const originalFetch = unsafeWindow.fetch
  unsafeWindow.fetch = function (input, init = {}) {
    const requestUrl = input instanceof Request ? input.url : String(input) // Ensure input is stringified
    const requestBaseUrl = getBaseUrl(requestUrl)

    const method =
      input instanceof Request ? input.method : init.method || 'GET'
    const headers =
      input instanceof Request ? input.headers : init.headers || {}
    const body = input instanceof Request ? input.body : init.body // Note: body might be a stream

    let requestInfo:any = null
    const shouldMonitor = requestBaseUrl === targetBaseUrl

    if (shouldMonitor) {
      requestInfo = { url: requestUrl, method, headers, body, type: 'fetch' }
      if (typeof onRequest === 'function') {
        try {
          onRequest(requestInfo)
        } catch (e) {
          console.error('[API Monitor] Error in onRequest (fetch):', e)
        }
      }
    }

    const fetchPromise = originalFetch.apply(this, arguments)

    if (shouldMonitor) {
      fetchPromise
        .then(response => {
          const clonedResponse = response.clone()
          const processResponse = res => {
            if (typeof onResponse === 'function') {
              res
                .text()
                .then(textData => {
                  // Read as text first
                  let data = textData
                  try {
                    data = JSON.parse(textData) // Try parsing as JSON
                  } catch (e) {
                    // Keep as text if JSON parsing fails
                  }
                  try {
                    onResponse({
                      data,
                      response: clonedResponse,
                      type: 'fetch',
                    })
                  } catch (e) {
                    console.error(
                      '[API Monitor] Error in onResponse (fetch):',
                      e
                    )
                  }
                })
                .catch(err => {
                  console.error(
                    '[API Monitor] Error reading fetch response text:',
                    err
                  )
                  if (typeof onError === 'function') {
                    try {
                      onError({ error: err, requestInfo, type: 'fetch' })
                    } catch (e) {
                      console.error(
                        '[API Monitor] Error in onError (fetch response read):',
                        e
                      )
                    }
                  }
                })
            }
          }
          processResponse(clonedResponse) // Process the cloned response
          return response // Return the original response for the page
        })
        .catch(error => {
          console.error(`[API Monitor] Fetch request failed: ${requestUrl}`, error)
          if (typeof onError === 'function') {
            try {
              onError({ error, requestInfo, type: 'fetch' })
            } catch (e) {
              console.error(
                '[API Monitor] Error in onError (fetch request):',
                e
              )
            }
          }
        })
    }

    return fetchPromise
  }

  // --- 监听 XMLHttpRequest ---
  const originalXhrOpen = unsafeWindow.XMLHttpRequest.prototype.open
  const originalXhrSend = unsafeWindow.XMLHttpRequest.prototype.send

  unsafeWindow.XMLHttpRequest.prototype.open = function (method, url) {
    // Store the full URL and method
    this._requestURL = typeof url === 'string' ? url : url.toString(); // Ensure url is a string
    this._requestMethod = method
    // Store the base URL for comparison
    this._requestBaseURL = getBaseUrl(this._requestURL)
    return originalXhrOpen.apply(this, arguments)
  }

  unsafeWindow.XMLHttpRequest.prototype.send = function (body) {
    const xhr = this
    const requestUrl = xhr._requestURL
    const requestBaseUrl = xhr._requestBaseURL
    const method = xhr._requestMethod

    let requestInfo:any = null
    const shouldMonitor = requestBaseUrl === targetBaseUrl

    if (shouldMonitor) {
      // Note: Accessing request headers set via setRequestHeader is complex before send()
      requestInfo = { url: requestUrl, method, body, type: 'xhr' }
      if (typeof onRequest === 'function') {
        try {
          onRequest(requestInfo)
        } catch (e) {
          console.error('[API Monitor] Error in onRequest (XHR):', e)
        }
      }

      const originalOnReadyStateChange = xhr.onreadystatechange
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          // Done
          if (xhr.status >= 200 && xhr.status < 300) {
            // Success
            if (typeof onResponse === 'function') {
              let data = xhr.responseText
              try {
                data = JSON.parse(xhr.responseText)
              } catch (e) {
                // Keep as text
              }
              try {
                onResponse({ data, response: xhr, type: 'xhr' })
              } catch (e) {
                console.error('[API Monitor] Error in onResponse (XHR):', e)
              }
            }
          } else {
            // Error
            console.error(
              `[API Monitor] XHR request failed: ${requestUrl}`,
              xhr.status,
              xhr.statusText
            )
            if (typeof onError === 'function') {
              try {
                onError({
                  error: new Error(`XHR failed with status ${xhr.status}`),
                  requestInfo,
                  response: xhr,
                  type: 'xhr',
                })
              } catch (e) {
                console.error('[API Monitor] Error in onError (XHR):', e)
              }
            }
          }
        }
        if (originalOnReadyStateChange) {
          originalOnReadyStateChange.apply(this, arguments)
        }
      }

      // Handle onerror event as well
      const originalOnError = xhr.onerror
      xhr.onerror = function (event) {
        console.error(`[API Monitor] XHR onerror triggered: ${requestUrl}`, event)
        if (typeof onError === 'function') {
          try {
            onError({ error: event, requestInfo, type: 'xhr' })
          } catch (e) {
            console.error('[API Monitor] Error in onError (XHR onerror):', e)
          }
        }
        if (originalOnError) {
          originalOnError.apply(this, arguments)
        }
      }
    }

    return originalXhrSend.apply(this, arguments)
  }

  console.log(`[API Monitor] Initialized for base URL: ${targetBaseUrl}`)
}
