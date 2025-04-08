const API_URL =
  'https://data.ccmgip.linlin.world/raw_collections_data?select=id,name,heat,on_sale_lowest_price,l2_lastest_price,liquid_count,l2_lowest_price,on_sale_count,l2_lastest_sale_time&limit=2000'
const STORAGE_KEY = 'ccmgip_collection_data'
const REFRESH_KEY = 'ccmgip_refresh_status'
const DEFAULT_REFRESH_INTERVAL = 60 * 3 // 默认刷新间隔（秒）
const MIN_REFRESH_INTERVAL = 10 // 最小刷新间隔（秒）
const CHECK_FREQUENCY = 5000 // 检查数据是否需要刷新的频率（毫秒）
const MAX_RETRY = 3 // 最大重试次数

// 初始化脚本
export function dataManagerInit() {
  // 初始化全局 window 对象
  window.ccmgipData = {
    data: [],
    lastUpdatedAt: null,
    refreshInterval: DEFAULT_REFRESH_INTERVAL,
    isLoading: false,
    error: null,
    updateData,
  }

  // 从 localStorage 加载初始数据
  updateGlobalObject()
  // 执行初始检查
  checkAndUpdateData()
  // 设置周期性检查
  setInterval(checkAndUpdateData, CHECK_FREQUENCY)
  // 处理可见性变化以暂停当标签页不可见时
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      // 页面重新可见时检查更新
      checkAndUpdateData()
    }
  })
  // 监听来自其他标签页的存储变化
  window.addEventListener('storage', event => {
    if (event.key === STORAGE_KEY && event.newValue) {
      console.log('[CCMGIP] 数据从另一个标签页更新')
      updateGlobalObject(JSON.parse(event.newValue))
    }
  })
  console.log('[CCMGIP] 数据收集管理器初始化完成')
}

// 用重试机制获取数据的函数
async function fetchData(retryCount = 0) {
  try {
    const response = await fetch(API_URL, {
      headers: {
        Accept: 'application/json',
        Prefer: 'return=representation',
      },
    })
    if (!response.ok) {
      throw new Error(`数据获取失败: ${response.statusText}`)
    }
    const data = await response.json()
    console.log(`[CCMGIP] 获取了 ${data.length} 项数据成功`)
    return data
  } catch (error) {
    console.error(
      `[CCMGIP] 获取数据时出错（尝试 ${retryCount + 1}/${MAX_RETRY} 次）:`,
      error
    )
    if (retryCount < MAX_RETRY - 1) {
      // 指数回退重试
      const delay = Math.pow(2, retryCount) * 1000
      console.log(`[CCMGIP] ${delay / 1000} 秒后重试...`)
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(fetchData(retryCount + 1))
        }, delay)
      })
    }
    throw error
  }
}

// 从 localStorage 获取存储数据的函数
function getStoredData() {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY)
    return storedData ? JSON.parse(storedData) : null
  } catch (error) {
    console.error('[CCMGIP] 解析存储数据时出错:', error)
    return null
  }
}

// 将数据存储到 localStorage 的函数
function storeData(data, refreshInterval = DEFAULT_REFRESH_INTERVAL) {
  const storageData = {
    data: data,
    lastUpdatedAt: Date.now(),
    refreshInterval: Math.max(refreshInterval, MIN_REFRESH_INTERVAL),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData))
  return storageData
}

// 检查是否需要刷新数据的函数
function isRefreshNeeded() {
  const storedData = getStoredData()
  if (!storedData) return true
  const now = Date.now()
  const lastUpdate = storedData.lastUpdatedAt
  const interval =
    (storedData.refreshInterval || DEFAULT_REFRESH_INTERVAL) * 1000
  return now - lastUpdate > interval
}

// 检查是否有其他标签页正在刷新数据的函数
function isAnotherTabRefreshing() {
  try {
    const refreshStatus = localStorage.getItem(REFRESH_KEY)
    if (!refreshStatus) return false
    const status = JSON.parse(refreshStatus)
    // 检查刷新操作是否已经过时（超过30秒）
    if (Date.now() - status.timestamp > 30000) {
      localStorage.removeItem(REFRESH_KEY)
      return false
    }
    return true
  } catch (error) {
    console.error('[CCMGIP] 检查刷新状态时出错:', error)
    return false
  }
}

// 设置刷新状态以协调不同标签页之间的刷新操作
function setRefreshStatus(isRefreshing) {
  if (isRefreshing) {
    localStorage.setItem(
      REFRESH_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        tabId: Math.random().toString(36).substring(2),
      })
    )
  } else {
    localStorage.removeItem(REFRESH_KEY)
  }
}

// 更新 window.ccmgipData 对象
function updateGlobalObject(data = null) {
  const storedData = data || getStoredData()
  if (storedData) {
    window.ccmgipData.data = storedData.data
    window.ccmgipData.lastUpdatedAt = storedData.lastUpdatedAt
    window.ccmgipData.refreshInterval = storedData.refreshInterval
  }
}

// 主要功能: 检查并更新数据
async function checkAndUpdateData() {
  // 如果页面不可见，跳过更新
  if (document.hidden) {
    return
  }
  // 如果其他标签页正在刷新数据，跳过更新
  if (isAnotherTabRefreshing()) {
    updateGlobalObject()
    return
  }
  // 如果不需要刷新数据，跳过更新
  if (!isRefreshNeeded()) {
    updateGlobalObject()
    return
  }
  await updateData()
}

async function updateData() {
  try {
    window.ccmgipData.isLoading = true
    setRefreshStatus(true)
    const data = await fetchData()
    const refreshInterval =
      getStoredData()?.refreshInterval || DEFAULT_REFRESH_INTERVAL
    const updatedData = storeData(data, refreshInterval)

    window.ccmgipData.data = updatedData.data
    window.ccmgipData.lastUpdatedAt = updatedData.lastUpdatedAt
    window.ccmgipData.refreshInterval = updatedData.refreshInterval
    window.ccmgipData.isLoading = false
    window.ccmgipData.error = null

    console.log('[CCMGIP] 数据成功更新并存储')
  } catch (error) {
    window.ccmgipData.error = error.message
    console.error('[CCMGIP] 数据更新失败:', error)
  } finally {
    window.ccmgipData.isLoading = false
    setRefreshStatus(false)
  }
}
