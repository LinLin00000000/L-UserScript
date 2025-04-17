export * from './dynamicQuery'
import { build } from '../usbuild'

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
