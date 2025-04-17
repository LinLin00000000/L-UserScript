import { waitForObject } from './utils'

const DEFAULT_REFRESH_INTERVAL = 60 * 3 // 默认刷新间隔（秒）
const MAX_RETRY = 3 // 最大重试次数
let ccmgipData

function getStorageKey(objectName) {
  return `ccmgip_data_${objectName}`
}

function getRefreshKey(objectName) {
  return `ccmgip_refresh_${objectName}`
}

// 用重试机制获取数据的函数
async function fetchData(apiUrl, objectName, retryCount = 0) {
  try {
    const response = await fetch(apiUrl)
    if (!response.ok) {
      throw new Error(`[${objectName}] 数据获取失败: ${response.statusText}`)
    }
    const data = await response.json()
    console.log(`[${objectName}] 获取了 ${data.length} 项数据成功`)
    return data
  } catch (error) {
    console.error(
      `[${objectName}] 获取数据时出错（尝试 ${retryCount + 1}/${MAX_RETRY} 次）:`,
      error
    )
    if (retryCount < MAX_RETRY - 1) {
      const delay = Math.pow(2, retryCount) * 1000
      console.log(`[${objectName}] ${delay / 1000} 秒后重试...`)
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(fetchData(apiUrl, objectName, retryCount + 1))
        }, delay)
      })
    }
    throw error
  }
}

// 从 GM 存储获取指定对象存储数据的函数
async function getStoredData(objectName) {
  const storageKey = getStorageKey(objectName)
  try {
    // GM_getValue 直接返回值，如果未找到则返回 undefined
    const storedData = await GM_getValue(storageKey, null)
    return storedData // 假设 GM_setValue 直接存储对象结构
  } catch (error) {
    console.error(`[${objectName}] 获取 GM 存储数据时出错:`, error)
    return null
  }
}

// 将指定对象的数据存储到 GM 存储的函数
async function storeData(objectName, data, refreshInterval) {
  const storageKey = getStorageKey(objectName)
  const storageData = {
    data: data,
    lastUpdatedAt: Date.now(),
    refreshInterval: refreshInterval,
  }
  try {
    await GM_setValue(storageKey, storageData) // 直接存储对象
  } catch (e) {
    console.error(`[${objectName}] 存储数据到 GM 时出错:`, e)
  }
  return storageData
}

// 检查指定对象是否需要刷新数据的函数
async function isRefreshNeeded(objectName) {
  const storedData = await getStoredData(objectName)
  if (!storedData) return true // 没有数据，需要获取

  const state = ccmgipData[objectName]
  if (!state) return true // 状态未初始化

  const now = Date.now()
  const lastUpdate = storedData.lastUpdatedAt
  // 优先使用存储中的间隔，然后是当前状态的间隔，最后是默认间隔
  const interval =
    (storedData.refreshInterval ||
      state.refreshInterval ||
      DEFAULT_REFRESH_INTERVAL) * 1000
  return now - lastUpdate > interval
}

// 检查是否有其他标签页正在刷新指定对象数据的函数
async function isAnotherTabRefreshing(objectName) {
  const refreshKey = getRefreshKey(objectName)
  try {
    const refreshStatus = await GM_getValue(refreshKey, null)
    if (!refreshStatus) return false
    // 检查刷新操作是否已经过时（例如，超过 30 秒）
    if (Date.now() - refreshStatus.timestamp > 30000) {
      await GM_deleteValue(refreshKey) // 清理过时的状态
      return false
    }
    return true
  } catch (error) {
    console.error(`[${objectName}] 检查 GM 刷新状态时出错:`, error)
    // 出错时假设没有其他标签页在刷新，以允许当前标签页尝试
    return false
  }
}

// 设置指定对象的刷新状态
async function setRefreshStatus(objectName, isRefreshing) {
  const refreshKey = getRefreshKey(objectName)
  if (isRefreshing) {
    await GM_setValue(refreshKey, {
      timestamp: Date.now(),
      tabId: Math.random().toString(36).substring(2), // 简单的唯一标识符
    })
  } else {
    await GM_deleteValue(refreshKey)
  }
}

// 更新指定对象的 ccmgipData[objectName]
async function updateGlobalObject(objectName, data = null) {
  // 使用提供的数据或从存储中获取
  const storedData = data || (await getStoredData(objectName))
  if (storedData && ccmgipData[objectName]) {
    const state = ccmgipData[objectName]
    state.data = storedData.data
    state.lastUpdatedAt = storedData.lastUpdatedAt
    // 只有在存储的数据中有 refreshInterval 时才更新它，避免覆盖 manageDataSource 设置的值
    if (storedData.refreshInterval !== undefined) {
      state.refreshInterval = storedData.refreshInterval
    }
    if (typeof state._onDataLoad === 'function') {
      try {
        state._onDataLoad(state)
      } catch (callbackError) {
        console.error(
          `[${objectName}] 执行 onDataLoad 回调 (来自存储事件) 时出错:`,
          callbackError
        )
      }
    }
  } else if (ccmgipData[objectName]) {
    // 如果没有存储数据，确保状态存在但数据为空
    ccmgipData[objectName].data = []
    ccmgipData[objectName].lastUpdatedAt = null
  }
}

/**
 * 初始化并管理一个数据源
 * @param {object} config 配置对象
 * @param {string} config.apiUrl 数据源的 API URL
 * @param {string} config.objectName 挂载到 ccmgipData 的属性名
 * @param {number} [config.refreshInterval=DEFAULT_REFRESH_INTERVAL] 刷新间隔（秒）
 * @param {function(object):void} [config.onDataLoad] 数据成功加载（来自网络或缓存）后执行的回调函数，接收 state 对象作为参数
 */
export async function useDataSource(config) {
  const {
    apiUrl,
    objectName,
    refreshInterval = DEFAULT_REFRESH_INTERVAL,
    onDataLoad,
  } = config

  // 计算检查频率 (刷新间隔的 1/6，最小 5 秒，最大 60 秒)
  const checkFrequency = Math.min(
    60000,
    Math.max(5000, (refreshInterval * 1000) / 6)
  )

  // 为此数据源创建特定的更新和检查函数
  const updateDataForObject = async () => {
    const state = ccmgipData[objectName]
    if (!state) return // 如果状态被移除则停止

    try {
      state.isLoading = true
      state.error = null // 清除之前的错误
      await setRefreshStatus(objectName, true)

      const fetchedData = await fetchData(apiUrl, objectName)
      const currentRefreshInterval = state.refreshInterval // 使用当前状态中的刷新间隔
      const updatedStorageData = await storeData(
        objectName,
        fetchedData,
        currentRefreshInterval
      )

      // 更新全局状态
      state.data = updatedStorageData.data
      state.lastUpdatedAt = updatedStorageData.lastUpdatedAt
      // refreshInterval 已在 storeData 中设置到 storage，并在 updateGlobalObject 中同步回来
      state.isLoading = false

      // 如果提供了回调函数，则执行它
      if (typeof onDataLoad === 'function') {
        try {
          onDataLoad(state)
        } catch (callbackError) {
          console.error(
            `[${objectName}] 执行 onDataLoad 回调 (fetch 成功) 时出错:`,
            callbackError
          )
        }
      }

      console.log(`[${objectName}] 数据成功更新并存储`)
    } catch (error) {
      state.error = error.message
      console.error(`[${objectName}] 数据更新失败:`, error)
      if (state) state.error = error.message // 确保错误反映在状态中
    } finally {
      if (state) state.isLoading = false // 确保 isLoading 被重置
      await setRefreshStatus(objectName, false)
    }
  }

  const checkAndUpdateDataForObject = async () => {
    // 如果页面不可见，跳过更新
    if (document.hidden) {
      return
    }
    // 如果其他标签页正在刷新此数据，跳过更新，但确保本地状态与 GM 存储同步
    if (await isAnotherTabRefreshing(objectName)) {
      await updateGlobalObject(objectName) // 从 GM 存储更新状态
      return
    }
    // 如果不需要刷新数据，跳过更新，但确保本地状态与 GM 存储同步
    if (!(await isRefreshNeeded(objectName))) {
      await updateGlobalObject(objectName) // 从 GM 存储更新状态
      return
    }
    // 执行更新
    await updateDataForObject()
  }

  // 初始化此数据源的状态对象
  ccmgipData[objectName] = {
    data: [],
    lastUpdatedAt: null,
    refreshInterval: refreshInterval,
    isLoading: false,
    error: null,
    apiUrl: apiUrl, // 保存 apiUrl 和 refreshInterval 以备后用
    updateData: updateDataForObject, // 提供手动更新的方法
    _checkAndUpdate: checkAndUpdateDataForObject, // 内部检查函数引用
    _intervalId: null, // 用于存储 setInterval 的 ID
    _onDataLoad: onDataLoad, // 存储回调引用
  }

  // 立即检查并更新数据
  await checkAndUpdateDataForObject()

  // 设置周期性检查
  // 清除可能存在的旧定时器（如果重复调用 useDataSource）
  if (ccmgipData[objectName]._intervalId) {
    clearInterval(ccmgipData[objectName]._intervalId)
  }
  ccmgipData[objectName]._intervalId = setInterval(
    () =>
      checkAndUpdateDataForObject().catch(err =>
        console.error(`[${objectName}] 定时检查出错:`, err)
      ), // 为异步检查添加错误处理
    checkFrequency
  )

  console.log(
    `[${objectName}] 数据源管理器初始化完成，检查频率: ${checkFrequency / 1000}s`
  )
}

function globalListen() {
  // 处理可见性变化
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      console.log('[CCMGIP] 页面变为可见，检查所有数据源')
      // 页面重新可见时检查所有数据源
      for (const objectName in ccmgipData) {
        if (
          ccmgipData.hasOwnProperty(objectName) &&
          ccmgipData[objectName]._checkAndUpdate
        ) {
          // 调用异步函数，处理潜在错误
          ccmgipData[objectName]
            ._checkAndUpdate()
            .catch(err =>
              console.error(`[${objectName}] 可见性触发检查出错:`, err)
            )
        }
      }
    }
  })

  // 监听来自其他标签页/脚本实例的 GM 存储变化
  GM_addValueChangeListener(
    getStorageKey('*'),
    async (key, oldValue, newValue, remote) => {
      // 检查更改是否由另一个标签页/实例进行
      if (remote) {
        const match = key.match(/^ccmgip_data_(.+)$/)
        if (match) {
          const objectName = match[1]
          if (ccmgipData[objectName]) {
            console.log(`[${objectName}] 数据从另一个实例更新 (GM Storage)`)
            // newValue 已经是 GM_setValue 存储的对象
            await updateGlobalObject(objectName, newValue) // 使用新数据更新全局对象
          }
        }
      }
    }
  )
}

export async function dataManagerInit() {
  ccmgipData = globalThis.ccmgipData = globalThis.ccmgipData || {}

  globalListen()

  console.log('[CCMGIP] 数据管理器核心已加载')

  useDataSource({
    apiUrl:
      'https://data.ccmgip.linlin.world/raw_collections_data?select=id,name,heat,on_sale_lowest_price,l2_lastest_price,liquid_count,l2_lowest_price,on_sale_count,l2_lastest_sale_time&limit=2000',
    objectName: 'nft',
    refreshInterval: 60,
    onDataLoad: state => {
      state.data.byName = {}
      state.data.byId = {}
      state.data.forEach(item => {
        state.data.byName[item.name] = item
        state.data.byId[item.id] = item
      })
    },
  })
}

export const useNfts = () =>
  waitForObject('ccmgipData.nft.data', {
    requireNonEmptyArray: true,
  })
