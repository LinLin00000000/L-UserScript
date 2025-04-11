/**
 * 浏览器锁机制工具类
 * 当浏览器支持 Web Locks API 时使用该原生 API
 * 否则回退到使用 localStorage 实现锁机制
 */
class BrowserLock {
  constructor() {
    this.useWebLocks =
      typeof navigator !== 'undefined' && typeof navigator.locks !== 'undefined'
  }

  /**
   * 使用锁执行指定的函数
   * @param {string} name - 锁的名称
   * @param {Function} callback - 获得锁后要执行的函数
   * @param {Object} options - 配置选项
   * @param {number} options.timeout - 获取锁的超时时间(毫秒)
   * @returns {Promise<any>} 回调函数的执行结果
   */
  async withLock(name, callback, options = {}) {
    const { timeout = 5000 } = options

    if (this.useWebLocks) {
      return this._withWebLock(name, callback, timeout)
    } else {
      return this._withLocalStorageLock(name, callback, timeout)
    }
  }

  /**
   * 使用 Web Locks API 实现锁
   */
  async _withWebLock(name, callback, timeout) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      return await navigator.locks.request(
        name,
        { signal: controller.signal },
        async () => await callback()
      )
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error(`获取锁 "${name}" 超时 (${timeout}ms)`)
      }
      throw error
    } finally {
      clearTimeout(timeoutId)
    }
  }

  /**
   * 使用 localStorage 实现锁
   */
  async _withLocalStorageLock(name, callback, timeout) {
    const lockKey = `lock_${name}`
    const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2)}`

    await this._acquireLocalStorageLock(lockKey, uniqueId, timeout)

    try {
      return await callback()
    } finally {
      this._releaseLocalStorageLock(lockKey, uniqueId)
    }
  }

  /**
   * 基于 localStorage 获取锁
   */
  async _acquireLocalStorageLock(lockKey, uniqueId, timeout) {
    const startTime = Date.now()

    while (true) {
      // 检查是否超时
      if (Date.now() - startTime > timeout) {
        throw new Error(`获取锁 "${lockKey}" 超时 (${timeout}ms)`)
      }

      const currentLock = localStorage.getItem(lockKey)
      if (!currentLock) {
        // 尝试获取锁
        localStorage.setItem(lockKey, uniqueId)

        // 检查是否成功获取锁（处理竞态条件）
        if (localStorage.getItem(lockKey) === uniqueId) {
          return true
        }
      }

      // 随机等待，避免多个客户端同时尝试获取锁
      await new Promise(resolve =>
        setTimeout(resolve, 50 + Math.floor(Math.random() * 50))
      )
    }
  }

  /**
   * 基于 localStorage 释放锁
   */
  _releaseLocalStorageLock(lockKey, uniqueId) {
    try {
      // 只释放自己持有的锁
      if (localStorage.getItem(lockKey) === uniqueId) {
        localStorage.removeItem(lockKey)
        return true
      }
    } catch (error) {
      console.error(`释放锁失败:`, error)
    }
    return false
  }
}

// 创建单例
const browserLock = new BrowserLock()

// 导出简洁的 API
export default {
  /**
   * 获取锁并执行回调函数
   * @example
   * await lock.withLock('resource-name', async () => {
   *   // 在锁保护下执行的操作
   * }, { timeout: 3000 });
   */
  withLock: (name, callback, options) =>
    browserLock.withLock(name, callback, options),
}
