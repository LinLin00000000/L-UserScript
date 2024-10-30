export type processNode = (node: Element) => void
export type SelectorCallbackTuple = [string, processNode]

export const dynamicQuery = (() => {
  function addObserver(target: Node, callback: (node: Node) => void) {
    // observer 断开连接之后，正在运行的循环仍会运行，所以使用一个 canceled 变量在断开之后立即结束循环
    let canceled = false
    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList' || mutation.type === 'attributes') {
          if (canceled) return
          callback(mutation.target)

          for (const node of mutation.addedNodes) {
            if (canceled) return
            callback(node)
          }
        }
      }
    })

    observer.observe(target, {
      subtree: true,
      childList: true,
      attributes: true,
    })
    return () => {
      canceled = true
      observer.disconnect()
    }
  }

  // 确保每个 Node 仅有一个 observer，避免创建大量的观察者对象
  const observedNodeMap = new WeakMap<
    Node,
    { processors: Set<SelectorCallbackTuple>; remove: () => void }
  >()

  function addProcessor(target: Node, processor: SelectorCallbackTuple) {
    let observedNode = observedNodeMap.get(target)
    if (!observedNode) {
      // 确保每个元素仅触发一次检查
      let checked: WeakSet<Node> | null = new WeakSet()

      // 这里 Set 仅保存二元组（数组）的引用，作用是为了能方便地删除 processor
      let processors: Set<SelectorCallbackTuple> | null = new Set()

      const checkAndApply = (e: Element) => {
        if (checked && !checked.has(e)) {
          checked.add(e)
          processors?.forEach(([s, f]) => {
            if (e.matches(s)) {
              f(e)
            }
          })
        }
      }

      const disconnect = addObserver(target, e => {
        if (e instanceof Element) {
          checkAndApply(e)

          // 当一个 observer 绑定大量 selector 时，仅需执行一次 querySelectorAll
          e.querySelectorAll('*').forEach(checkAndApply)
        }
      })

      observedNode = {
        processors,
        remove: () => {
          disconnect()
          checked = null
          processors = null
        },
      }
      observedNodeMap.set(target, observedNode)
    }
    observedNode.processors.add(processor)
  }

  // 返回是否在本次 removeProcessor 中删除了 processor，不论如何总是会保证删除
  function removeProcessor(target: Node, processor: SelectorCallbackTuple) {
    const observedNode = observedNodeMap.get(target)
    if (!observedNode) return false

    const isDeleteInThisTime = observedNode.processors.delete(processor)
    if (!observedNode.processors.size) {
      observedNode.remove()
      observedNodeMap.delete(target)
    }
    return isDeleteInThisTime
  }

  /**
   * 该函数用于观察和响应 DOM 的动态变化。
   * 它提供了一种方式，可以将自定义回调应用到匹配特定选择器的元素上，用于动态查询和处理 DOM 元素。
   * @param selector 要匹配元素的 CSS 选择器或选择器数组。
   * @param callback 处理匹配元素的回调函数。
   * @param options 配置选项，包含一系列可选设置：
   *        - parent?: ParentNode - 父节点，默认为 document。
   *        - once?: boolean - 是否只执行一次，默认为 true。
   *        - timeout?: number - 超时时间（毫秒），默认为 -1，表示无超时。
   *        - onTimeout?: () => void - 超时时的回调函数。
   *        - all?: boolean - 是否模拟 querySelectorAll，默认为 true。
   *        - allDelay?: number - 模拟 querySelectorAll 时的 debounce 延时（毫秒），默认为 1000。
   * @returns 一个函数，用于取消所有 selector，其返回值为是否在调用函数时移除了所有 selector
   */
  return function (
    selector: string | string[],
    callback: processNode = (node: Element) => console.log(node),
    options: {
      parent?: ParentNode
      once?: boolean
      timeout?: number
      onTimeout?: () => void
      all?: boolean
      allDelay?: number
    } = {}
  ) {
    const {
      parent = document,
      once = true,
      timeout = -1,
      onTimeout = () => console.log('dynamicQuery Timeout!', arguments),
      all = true,
      allDelay = 1000,
    } = options

    const selectors = Array.isArray(selector) ? selector : [selector]

    // 总是会先立即执行 querySelector(All) 并应用 callback
    const notExistSelectors = selectors.filter(selector => {
      const result = all
        ? parent.querySelectorAll(selector)
        : ([parent.querySelector(selector)].filter(
            e => e !== null
          ) as Element[])
      result.forEach(callback) // Side Effect!

      // 筛选留下查询不到的 selector
      return result.length === 0
    })

    if (once && notExistSelectors.length === 0) return () => false

    // 如为 once，仅需监听现存页面查询不到的 selector，否则持续监听所有 selector
    const listenSelectors = once ? notExistSelectors : selectors

    const processors = listenSelectors.map(selector => {
      // 对于每个 selector， 保证对符合要求的每个元素仅处理一次
      const processed = new WeakSet()
      let timer
      const process = (e: Element) => {
        if (!processed.has(e)) {
          processed.add(e)
          callback(e)

          if (once) {
            if (all) {
              // 使用 timer 实现 debounce，在一定时间间隔内出现的符合 selector 的每个元素都会被处理
              // 以此来模拟 querySelectorAll 的效果
              clearTimeout(timer)
              timer = setTimeout(remove, allDelay)
            } else {
              // 如果 once 为 true 且 all 为假，则类似单个 querySelector，回调触发一次就立即 remove
              remove()
            }
          }
        }
      }
      const processor: SelectorCallbackTuple = [selector, process]
      const remove = () => removeProcessor(parent, processor)

      addProcessor(parent, processor)
      return remove
    })
    const removeAllProcessor = () => processors.every(f => f())

    // 如果设置了 timeout 超时参数，则不论其他参数如何都会移除本次函数调用添加的所有 selector
    if (timeout >= 0) {
      setTimeout(() => {
        removeAllProcessor()
        onTimeout()
      }, timeout)
    }

    // 返回一个手动移除本次函数调用添加的所有 selector 的函数
    // 这个函数的返回值是是否在调用函数的时候移除了所有 selector
    // 如果因为新出现的元素有符合 selector 的，执行 callback 之后自动 remove 了相应的 processor，则返回值为假
    return removeAllProcessor
  }
})()

/**
 * 该函数用于持续观察和响应 DOM 的动态变化。
 * 它提供了一种方式，可以将自定义回调应用到匹配特定选择器的元素上，用于动态查询和处理 DOM 元素。
 * @param selector 要匹配元素的 CSS 选择器或选择器数组。
 * @param callback 处理匹配元素的回调函数。
 * @param options 配置选项，包含一系列可选设置：
 *        - parent?: ParentNode - 父节点，默认为 document。
 *        - timeout?: number - 超时时间（毫秒），默认为 -1，表示无超时。
 *        - onTimeout?: () => void - 超时时的回调函数。
 *        - all?: boolean - 是否模拟 querySelectorAll，默认为 true。
 *        - allDelay?: number - 模拟 querySelectorAll 时的 debounce 延时（毫秒），默认为 1000。
 * @returns 一个函数，用于取消所有 selector，其返回值为是否在调用函数时移除了所有 selector
 */
export const foreverQuery = (s, f, o) =>
  dynamicQuery(s, f, { once: false, ...o })
