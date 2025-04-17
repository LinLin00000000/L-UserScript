const DEFAULT_REFRESH_INTERVAL = 60 * 3 // 默认刷新间隔（秒）
const MAX_RETRY = 3 // 最大重试次数

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

// 从 localStorage 获取指定对象存储数据的函数
function getStoredData(objectName) {
  const storageKey = getStorageKey(objectName)
  try {
    const storedData = localStorage.getItem(storageKey)
    return storedData ? JSON.parse(storedData) : null
  } catch (error) {
    console.error(`[${objectName}] 解析存储数据时出错:`, error)
    return null
  }
}

// 将指定对象的数据存储到 localStorage 的函数
function storeData(objectName, data, refreshInterval) {
  const storageKey = getStorageKey(objectName)
  const storageData = {
    data: data,
    lastUpdatedAt: Date.now(),
    refreshInterval: refreshInterval,
  }
  try {
    localStorage.setItem(storageKey, JSON.stringify(storageData))
  } catch (e) {
    console.error(`[${objectName}] 存储数据时出错:`, e)
    // 可选：处理存储已满等情况
  }
  return storageData
}

// 检查指定对象是否需要刷新数据的函数
function isRefreshNeeded(objectName) {
  const storedData = getStoredData(objectName)
  if (!storedData) return true // 没有数据，需要获取

  const state = window.ccmgipData[objectName]
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
function isAnotherTabRefreshing(objectName) {
  const refreshKey = getRefreshKey(objectName)
  try {
    const refreshStatus = localStorage.getItem(refreshKey)
    if (!refreshStatus) return false
    const status = JSON.parse(refreshStatus)
    // 检查刷新操作是否已经过时（例如，超过 30 秒）
    if (Date.now() - status.timestamp > 30000) {
      localStorage.removeItem(refreshKey) // 清理过时的状态
      return false
    }
    return true
  } catch (error) {
    console.error(`[${objectName}] 检查刷新状态时出错:`, error)
    // 出错时假设没有其他标签页在刷新，以允许当前标签页尝试
    return false
  }
}

// 设置指定对象的刷新状态
function setRefreshStatus(objectName, isRefreshing) {
  const refreshKey = getRefreshKey(objectName)
  if (isRefreshing) {
    localStorage.setItem(
      refreshKey,
      JSON.stringify({
        timestamp: Date.now(),
        tabId: Math.random().toString(36).substring(2), // 简单的唯一标识符
      })
    )
  } else {
    localStorage.removeItem(refreshKey)
  }
}

// 更新指定对象的 window.ccmgipData[objectName]
function updateGlobalObject(objectName, data = null) {
  const storedData = data || getStoredData(objectName)
  if (storedData && window.ccmgipData[objectName]) {
    window.ccmgipData[objectName].data = storedData.data
    window.ccmgipData[objectName].lastUpdatedAt = storedData.lastUpdatedAt
    // 只有在存储的数据中有 refreshInterval 时才更新它，避免覆盖 manageDataSource 设置的值
    if (storedData.refreshInterval !== undefined) {
      window.ccmgipData[objectName].refreshInterval = storedData.refreshInterval
    }
  } else if (window.ccmgipData[objectName]) {
    // 如果没有存储数据，确保状态存在但数据为空
    window.ccmgipData[objectName].data = []
    window.ccmgipData[objectName].lastUpdatedAt = null
  }
}

// --- 主管理函数 ---

/**
 * 初始化并管理一个数据源
 * @param {string} apiUrl 数据源的 API URL
 * @param {string} objectName 挂载到 window.ccmgipData 的属性名
 * @param {number} [refreshInterval=DEFAULT_REFRESH_INTERVAL] 刷新间隔（秒）
 */
export function useDataSource(
  apiUrl,
  objectName,
  refreshInterval = DEFAULT_REFRESH_INTERVAL
) {
  if (!apiUrl || !objectName) {
    console.error('[CCMGIP] 参数不足')
    return
  }

  // 计算检查频率 (刷新间隔的 1/6，最小 5 秒，最大 60 秒)
  const checkFrequency = Math.min(
    60000,
    Math.max(5000, (refreshInterval * 1000) / 6)
  )

  // 为此数据源创建特定的更新和检查函数
  const updateDataForObject = async () => {
    const state = window.ccmgipData[objectName]
    if (!state) return // 如果状态被移除则停止

    try {
      state.isLoading = true
      state.error = null // 清除之前的错误
      setRefreshStatus(objectName, true)

      const fetchedData = await fetchData(apiUrl, objectName)
      const currentRefreshInterval = state.refreshInterval // 使用当前状态中的刷新间隔
      const updatedStorageData = storeData(
        objectName,
        fetchedData,
        currentRefreshInterval
      )

      // 更新全局状态
      state.data = updatedStorageData.data
      state.lastUpdatedAt = updatedStorageData.lastUpdatedAt
      // state.refreshInterval 已在 storeData 中设置到 storage，并在 updateGlobalObject 中同步回来
      state.isLoading = false

      console.log(`[${objectName}] 数据成功更新并存储`)
    } catch (error) {
      state.error = error.message
      console.error(`[${objectName}] 数据更新失败:`, error)
    } finally {
      state.isLoading = false
      setRefreshStatus(objectName, false)
    }
  }

  const checkAndUpdateDataForObject = async () => {
    // 如果页面不可见，跳过更新
    if (document.hidden) {
      return
    }
    // 如果其他标签页正在刷新此数据，跳过更新，但确保本地状态与 localStorage 同步
    if (isAnotherTabRefreshing(objectName)) {
      updateGlobalObject(objectName) // 从 localStorage 更新状态
      return
    }
    // 如果不需要刷新数据，跳过更新，但确保本地状态与 localStorage 同步
    if (!isRefreshNeeded(objectName)) {
      updateGlobalObject(objectName) // 从 localStorage 更新状态
      return
    }
    // 执行更新
    await updateDataForObject()
  }

  // 初始化此数据源的状态对象
  window.ccmgipData[objectName] = {
    data: [],
    lastUpdatedAt: null,
    refreshInterval: refreshInterval,
    isLoading: false,
    error: null,
    apiUrl: apiUrl, // 保存 apiUrl 和 refreshInterval 以备后用
    updateData: updateDataForObject, // 提供手动更新的方法
    _checkAndUpdate: checkAndUpdateDataForObject, // 内部检查函数引用
    _intervalId: null, // 用于存储 setInterval 的 ID
  }

  // 从 localStorage 加载初始数据
  updateGlobalObject(objectName)

  // 执行初始检查
  checkAndUpdateDataForObject()

  // 设置周期性检查
  // 清除可能存在的旧定时器（如果重复调用 manageDataSource）
  if (window.ccmgipData[objectName]._intervalId) {
    clearInterval(window.ccmgipData[objectName]._intervalId)
  }
  window.ccmgipData[objectName]._intervalId = setInterval(
    checkAndUpdateDataForObject,
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
      for (const objectName in window.ccmgipData) {
        if (
          window.ccmgipData.hasOwnProperty(objectName) &&
          window.ccmgipData[objectName]._checkAndUpdate
        ) {
          window.ccmgipData[objectName]._checkAndUpdate()
        }
      }
    }
  })

  // 监听来自其他标签页的存储变化
  window.addEventListener('storage', event => {
    if (event.key && event.newValue) {
      // 检查是否是受管理的数据存储键
      const match = event.key.match(/^ccmgip_data_(.+)$/)
      if (match) {
        const objectName = match[1]
        if (window.ccmgipData[objectName]) {
          console.log(`[${objectName}] 数据从另一个标签页更新`)
          try {
            const newData = JSON.parse(event.newValue)
            updateGlobalObject(objectName, newData) // 使用新数据更新全局对象
          } catch (error) {
            console.error(
              `[${objectName}] 解析来自 storage 事件的数据时出错:`,
              error
            )
          }
        }
      }
      // 可选：也可以监听 refresh 状态的变化，但这通常不是必需的
    }
  })
}

export function dataManagerInit() {
  // 初始化全局 window 对象
  window.ccmgipData = window.ccmgipData || {}

  globalListen()

  console.log('[CCMGIP] 数据管理器核心已加载')

  useDataSource(
    'https://data.ccmgip.linlin.world/raw_collections_data?select=id,name,heat,on_sale_lowest_price,l2_lastest_price,liquid_count,l2_lowest_price,on_sale_count,l2_lastest_sale_time&limit=2000',
    'nft',
    60 * 3
  )
}
