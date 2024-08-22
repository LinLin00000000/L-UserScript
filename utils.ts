export { dynamicQuery, foreverQuery } from './dynamicQuery'
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
  return value === undefined || value === null
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
