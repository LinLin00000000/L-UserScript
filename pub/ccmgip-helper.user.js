// ==UserScript==
// @name         ccmgip helper
// @namespace    L-UserScript
// @version      0.3.0
// @author       Lin
// @license      MIT License
// @source       https://github.com/LinLin00000000/L-UserScript
// @description  Lin's userscript. 喵~
// @match        https://*.ccmgip.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_addValueChangeListener
// @grant        GM_addStyle
// ==/UserScript==


;(async function () {

// dynamicQuery.ts
var dynamicQuery = /* @__PURE__ */ (() => {
  function addObserver(target, callback) {
    let canceled = false;
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList" || mutation.type === "attributes") {
          if (canceled)
            return;
          callback(mutation.target);
          for (const node of mutation.addedNodes) {
            if (canceled)
              return;
            callback(node);
          }
        }
      }
    });
    observer.observe(target, {
      subtree: true,
      childList: true,
      attributes: true
    });
    return () => {
      canceled = true;
      observer.disconnect();
    };
  }
  const observedNodeMap = /* @__PURE__ */ new WeakMap();
  function addProcessor(target, processor) {
    let observedNode = observedNodeMap.get(target);
    if (!observedNode) {
      let checked = /* @__PURE__ */ new WeakSet();
      let processors = /* @__PURE__ */ new Set();
      const checkAndApply = (e) => {
        if (checked && !checked.has(e)) {
          checked.add(e);
          processors?.forEach(([s, f]) => {
            if (e.matches(s)) {
              f(e);
            }
          });
        }
      };
      const disconnect = addObserver(target, (e) => {
        if (e instanceof Element) {
          checkAndApply(e);
          e.querySelectorAll("*").forEach(checkAndApply);
        }
      });
      observedNode = {
        processors,
        remove: () => {
          disconnect();
          checked = null;
          processors = null;
        }
      };
      observedNodeMap.set(target, observedNode);
    }
    observedNode.processors.add(processor);
  }
  function removeProcessor(target, processor) {
    const observedNode = observedNodeMap.get(target);
    if (!observedNode)
      return false;
    const isDeleteInThisTime = observedNode.processors.delete(processor);
    if (!observedNode.processors.size) {
      observedNode.remove();
      observedNodeMap.delete(target);
    }
    return isDeleteInThisTime;
  }
  return function(selector, callback = (node) => console.log(node), options = {}) {
    const {
      parent = document,
      once = true,
      timeout = -1,
      onTimeout = () => console.log("dynamicQuery Timeout!", arguments),
      all = true,
      allDelay = 1e3
    } = options;
    const selectors = Array.isArray(selector) ? selector : [selector];
    const notExistSelectors = selectors.filter((selector2) => {
      const result = all ? parent.querySelectorAll(selector2) : [parent.querySelector(selector2)].filter(
        (e) => e !== null
      );
      result.forEach(callback);
      return result.length === 0;
    });
    if (once && notExistSelectors.length === 0)
      return () => false;
    const listenSelectors = once ? notExistSelectors : selectors;
    const processors = listenSelectors.map((selector2) => {
      const processed = /* @__PURE__ */ new WeakSet();
      let timer;
      const process = (e) => {
        if (!processed.has(e)) {
          processed.add(e);
          callback(e);
          if (once) {
            if (all) {
              clearTimeout(timer);
              timer = setTimeout(remove, allDelay);
            } else {
              remove();
            }
          }
        }
      };
      const processor = [selector2, process];
      const remove = () => removeProcessor(parent, processor);
      addProcessor(parent, processor);
      return remove;
    });
    const removeAllProcessor = () => processors.every((f) => f());
    if (timeout >= 0) {
      setTimeout(() => {
        removeAllProcessor();
        onTimeout();
      }, timeout);
    }
    return removeAllProcessor;
  };
})();
var foreverQuery = (s, f, o) => dynamicQuery(s, f, { once: false, ...o });
var dynamicQueryAsync = (selector, options) => new Promise((resolve) => dynamicQuery(selector, resolve, options));

// 这是力量的代价，不可避免 :)
function __usbuild() {
}

// utils.ts
function isNil(value) {
  return value === null || typeof value === "undefined";
}
var globalConfig = {
  namespace: "L-UserScript",
  version: "0.1.0",
  author: "Lin",
  license: "MIT License",
  source: "https://github.com/LinLin00000000/L-UserScript",
  description: "Lin's userscript. 喵~"
};
function mybuild(...args) {
  return __usbuild(
    {
      ...globalConfig,
      ...args[0]
    },
    args[1]
  );
}
function waitForElements(selector, maxTries = 20, interval = 500) {
  return new Promise((resolve, reject) => {
    let tries = 0;
    const checkExist = setInterval(() => {
      const elementsNodeList = document.querySelectorAll(selector);
      tries++;
      if (elementsNodeList.length > 0) {
        clearInterval(checkExist);
        resolve(Array.from(elementsNodeList));
      } else if (tries >= maxTries) {
        clearInterval(checkExist);
        console.log("Element not found after max tries: " + selector);
        reject(new Error("Element not found: " + selector));
      }
    }, interval);
  });
}
function waitForObject(pathString, options = {}) {
  const {
    parent = globalThis,
    // Default to globalThis if not provided
    maxTries = 100,
    interval = 100,
    requireNonEmptyArray = false
  } = options;
  return new Promise((resolve, reject) => {
    const pathParts = pathString.split(".");
    let tries = 0;
    let intervalHandle = void 0;
    const clearTimers = () => clearInterval(intervalHandle);
    const check = () => {
      tries++;
      let current = parent;
      let exists = true;
      for (const part of pathParts) {
        if (isNil(current) || isNil(current[part])) {
          exists = false;
          break;
        }
        current = current[part];
      }
      if (exists) {
        if (requireNonEmptyArray && Array.isArray(current) && current.length === 0) {
        } else {
          clearTimers();
          resolve(current);
          return;
        }
      }
      if (maxTries > 0 && tries >= maxTries) {
        console.error(
          `waitForObject: Failed to find object "${pathString}" after ${maxTries} tries.`
        );
        clearTimers();
        reject(new Error(`Max tries reached waiting for object: ${pathString}`));
      }
    };
    intervalHandle = setInterval(check, interval);
    check();
  });
}

// ccmgipDataManager.js
var DEFAULT_REFRESH_INTERVAL = 60 * 3;
var MAX_RETRY = 3;
var ccmgipData;
function getStorageKey(objectName) {
  return `ccmgip_data_${objectName}`;
}
function getRefreshKey(objectName) {
  return `ccmgip_refresh_${objectName}`;
}
async function fetchData(apiUrl, objectName, retryCount = 0) {
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`[${objectName}] 数据获取失败: ${response.statusText}`);
    }
    const data = await response.json();
    console.log(`[${objectName}] 获取了 ${data.length} 项数据成功`);
    return data;
  } catch (error) {
    console.error(
      `[${objectName}] 获取数据时出错（尝试 ${retryCount + 1}/${MAX_RETRY} 次）:`,
      error
    );
    if (retryCount < MAX_RETRY - 1) {
      const delay = Math.pow(2, retryCount) * 1e3;
      console.log(`[${objectName}] ${delay / 1e3} 秒后重试...`);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(fetchData(apiUrl, objectName, retryCount + 1));
        }, delay);
      });
    }
    throw error;
  }
}
async function getStoredData(objectName) {
  const storageKey = getStorageKey(objectName);
  try {
    const storedData = await GM_getValue(storageKey, null);
    return storedData;
  } catch (error) {
    console.error(`[${objectName}] 获取 GM 存储数据时出错:`, error);
    return null;
  }
}
async function storeData(objectName, data, refreshInterval) {
  const storageKey = getStorageKey(objectName);
  const storageData = {
    data,
    lastUpdatedAt: Date.now(),
    refreshInterval
  };
  try {
    await GM_setValue(storageKey, storageData);
  } catch (e) {
    console.error(`[${objectName}] 存储数据到 GM 时出错:`, e);
  }
  return storageData;
}
async function isRefreshNeeded(objectName) {
  const storedData = await getStoredData(objectName);
  if (!storedData)
    return true;
  const state = ccmgipData[objectName];
  if (!state)
    return true;
  const now = Date.now();
  const lastUpdate = storedData.lastUpdatedAt;
  const interval = (storedData.refreshInterval || state.refreshInterval || DEFAULT_REFRESH_INTERVAL) * 1e3;
  return now - lastUpdate > interval;
}
async function isAnotherTabRefreshing(objectName) {
  const refreshKey = getRefreshKey(objectName);
  try {
    const refreshStatus = await GM_getValue(refreshKey, null);
    if (!refreshStatus)
      return false;
    if (Date.now() - refreshStatus.timestamp > 3e4) {
      await GM_deleteValue(refreshKey);
      return false;
    }
    return true;
  } catch (error) {
    console.error(`[${objectName}] 检查 GM 刷新状态时出错:`, error);
    return false;
  }
}
async function setRefreshStatus(objectName, isRefreshing) {
  const refreshKey = getRefreshKey(objectName);
  if (isRefreshing) {
    await GM_setValue(refreshKey, {
      timestamp: Date.now(),
      tabId: Math.random().toString(36).substring(2)
      // 简单的唯一标识符
    });
  } else {
    await GM_deleteValue(refreshKey);
  }
}
async function updateGlobalObject(objectName, data = null) {
  const storedData = data || await getStoredData(objectName);
  if (storedData && ccmgipData[objectName]) {
    const state = ccmgipData[objectName];
    state.data = storedData.data;
    state.lastUpdatedAt = storedData.lastUpdatedAt;
    if (storedData.refreshInterval !== void 0) {
      state.refreshInterval = storedData.refreshInterval;
    }
    if (typeof state._onDataLoad === "function") {
      try {
        state._onDataLoad(state);
      } catch (callbackError) {
        console.error(
          `[${objectName}] 执行 onDataLoad 回调 (来自存储事件) 时出错:`,
          callbackError
        );
      }
    }
  } else if (ccmgipData[objectName]) {
    ccmgipData[objectName].data = [];
    ccmgipData[objectName].lastUpdatedAt = null;
  }
}
async function useDataSource(config) {
  const {
    apiUrl,
    objectName,
    refreshInterval = DEFAULT_REFRESH_INTERVAL,
    onDataLoad
  } = config;
  const checkFrequency = Math.min(
    6e4,
    Math.max(5e3, refreshInterval * 1e3 / 6)
  );
  const updateDataForObject = async () => {
    const state = ccmgipData[objectName];
    if (!state)
      return;
    try {
      state.isLoading = true;
      state.error = null;
      await setRefreshStatus(objectName, true);
      const fetchedData = await fetchData(apiUrl, objectName);
      const currentRefreshInterval = state.refreshInterval;
      const updatedStorageData = await storeData(
        objectName,
        fetchedData,
        currentRefreshInterval
      );
      state.data = updatedStorageData.data;
      state.lastUpdatedAt = updatedStorageData.lastUpdatedAt;
      state.isLoading = false;
      if (typeof onDataLoad === "function") {
        try {
          onDataLoad(state);
        } catch (callbackError) {
          console.error(
            `[${objectName}] 执行 onDataLoad 回调 (fetch 成功) 时出错:`,
            callbackError
          );
        }
      }
      console.log(`[${objectName}] 数据成功更新并存储`);
    } catch (error) {
      state.error = error.message;
      console.error(`[${objectName}] 数据更新失败:`, error);
      if (state)
        state.error = error.message;
    } finally {
      if (state)
        state.isLoading = false;
      await setRefreshStatus(objectName, false);
    }
  };
  const checkAndUpdateDataForObject = async () => {
    if (document.hidden) {
      return;
    }
    if (await isAnotherTabRefreshing(objectName)) {
      await updateGlobalObject(objectName);
      return;
    }
    if (!await isRefreshNeeded(objectName)) {
      await updateGlobalObject(objectName);
      return;
    }
    await updateDataForObject();
  };
  ccmgipData[objectName] = {
    data: [],
    lastUpdatedAt: null,
    refreshInterval,
    isLoading: false,
    error: null,
    apiUrl,
    // 保存 apiUrl 和 refreshInterval 以备后用
    updateData: updateDataForObject,
    // 提供手动更新的方法
    _checkAndUpdate: checkAndUpdateDataForObject,
    // 内部检查函数引用
    _intervalId: null,
    // 用于存储 setInterval 的 ID
    _onDataLoad: onDataLoad
    // 存储回调引用
  };
  await checkAndUpdateDataForObject();
  if (ccmgipData[objectName]._intervalId) {
    clearInterval(ccmgipData[objectName]._intervalId);
  }
  ccmgipData[objectName]._intervalId = setInterval(
    () => checkAndUpdateDataForObject().catch(
      (err) => console.error(`[${objectName}] 定时检查出错:`, err)
    ),
    // 为异步检查添加错误处理
    checkFrequency
  );
  console.log(
    `[${objectName}] 数据源管理器初始化完成，检查频率: ${checkFrequency / 1e3}s`
  );
}
function globalListen() {
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      console.log("[CCMGIP] 页面变为可见，检查所有数据源");
      for (const objectName in ccmgipData) {
        if (ccmgipData.hasOwnProperty(objectName) && ccmgipData[objectName]._checkAndUpdate) {
          ccmgipData[objectName]._checkAndUpdate().catch(
            (err) => console.error(`[${objectName}] 可见性触发检查出错:`, err)
          );
        }
      }
    }
  });
  GM_addValueChangeListener(
    getStorageKey("*"),
    async (key, oldValue, newValue, remote) => {
      if (remote) {
        const match = key.match(/^ccmgip_data_(.+)$/);
        if (match) {
          const objectName = match[1];
          if (ccmgipData[objectName]) {
            console.log(`[${objectName}] 数据从另一个实例更新 (GM Storage)`);
            await updateGlobalObject(objectName, newValue);
          }
        }
      }
    }
  );
}
async function dataManagerInit() {
  ccmgipData = globalThis.ccmgipData = globalThis.ccmgipData || {};
  globalListen();
  console.log("[CCMGIP] 数据管理器核心已加载");
  useDataSource({
    apiUrl: "https://data.ccmgip.linlin.world/raw_collections_data?select=id,name,heat,on_sale_lowest_price,l2_lastest_price,liquid_count,l2_lowest_price,on_sale_count,l2_lastest_sale_time&limit=2000",
    objectName: "nft",
    refreshInterval: 60,
    onDataLoad: (state) => {
      state.data.byName = {};
      state.data.byId = {};
      state.data.forEach((item) => {
        state.data.byName[item.name] = item;
        state.data.byId[item.id] = item;
      });
    }
  });
}
var useNfts = () => waitForObject("ccmgipData.nft.data", {
  requireNonEmptyArray: true
});

// ccmgip-helper.js
await mybuild(
  {
    match: ["https://*.ccmgip.com/*"],
    version: "0.3.0"
  },
  {
    dev: false,
    outdir: "pub"
  }
);
dataManagerInit();
if (location.href.includes("https://ershisi.ccmgip.com/24solar/donationActivity")) {
  const nfts = await useNfts();
  const container = await dynamicQueryAsync(
    '[class^="donationActivity_box-content"]'
  );
  const items = await waitForElements(
    '[class^="donationActivity_donationItem"]'
  );
  const processedItems = [];
  items.forEach((item) => {
    const nameElement = item.querySelector('[class^="donationActivity_row2"]');
    if (!nameElement)
      return;
    const name = nameElement.textContent.trim();
    const nftData = nfts.byName[name];
    if (!nftData) {
      console.log(`未找到藏品数据: ${name}`);
      return;
    }
    const onSalePrice = nftData.on_sale_lowest_price / 100;
    const pointsElement = item.querySelector(
      '[class^="donationActivity_points"]'
    );
    if (pointsElement) {
      let ratio = "无法计算";
      let ratioValue = Infinity;
      const pointValue = parseFloat(
        pointsElement.textContent.replace(/[^0-9.]/g, "")
      );
      if (isNaN(pointValue)) {
        console.log(`无法解析积分值: ${pointsElement.textContent}`);
        return;
      }
      const l2Price = pointValue / 100;
      if (l2Price && l2Price > 0) {
        ratioValue = onSalePrice / l2Price;
        ratio = `${onSalePrice} / ${l2Price} = ${ratioValue.toFixed(2)}`;
      } else {
        ratio = `${onSalePrice} / 0 = ∞`;
      }
      const ratioSpan = document.createElement("span");
      ratioSpan.className = "price-ratio";
      ratioSpan.style.fontSize = "12px";
      ratioSpan.style.display = "block";
      ratioSpan.style.color = "#ff9900";
      ratioSpan.style.marginLeft = "5px";
      ratioSpan.textContent = ratio;
      pointsElement.appendChild(ratioSpan);
      processedItems.push({
        element: item,
        ratioValue
      });
    }
  });
  processedItems.sort((a, b) => a.ratioValue - b.ratioValue);
  const subtitleElement = document.querySelector(
    '[class^="donationActivity_subtitle"]'
  );
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
  if (subtitleElement) {
    container.appendChild(subtitleElement.cloneNode(true));
  }
  processedItems.forEach((item) => {
    container.appendChild(item.element);
  });
  console.log("藏品已按价格比例排序完成");
}
var replaceBlindDetails = {
  "0195f977-54f1-4bf3-b12c-f7efb6c043ec": [
    {
      name: "树色平远图",
      probability: 15
    },
    {
      name: "鱼石图",
      probability: 15
    },
    {
      name: "汉宫观潮图",
      probability: 15
    },
    {
      name: "花鸟图",
      probability: 15
    },
    {
      name: "调琴啜茗图",
      probability: 15
    },
    {
      name: "忒PANDA·复古",
      probability: 0.1
    },
    {
      name: "雪景寒林图",
      probability: 0.5
    },
    {
      name: "青铜面具",
      probability: 0.5
    },
    {
      name: "杂花图",
      probability: 0.5
    },
    {
      name: "隶书道德经",
      probability: 0.5
    },
    {
      name: "青铜扭头跪坐人像",
      probability: 0.5
    },
    {
      name: "猴猫图",
      probability: 0.5
    },
    {
      name: "武侯高卧图",
      probability: 1
    },
    {
      name: "倪宽赞",
      probability: 0.5
    },
    {
      name: "象尊",
      probability: 0.5
    },
    {
      name: "鎏金犀牛",
      probability: 1
    },
    {
      name: "鼓吹骑俑",
      probability: 0.9
    },
    {
      name: "蜀川胜概图",
      probability: 1
    },
    {
      name: "虎钮如意云纹青玉握",
      probability: 3
    },
    {
      name: "白釉划花褐彩牡丹纹瓷腰圆枕",
      probability: 4
    },
    {
      name: "瑶岛仙真图",
      probability: 5
    },
    {
      name: "蜀山行旅图",
      probability: 5
    }
  ],
  "019569e1-4d7f-4965-b3e7-b68c2ce8f30a": [
    {
      name: "树色平远图",
      probability: 15
    },
    {
      name: "鱼石图",
      probability: 15
    },
    {
      name: "汉宫观潮图",
      probability: 15
    },
    {
      name: "花鸟图",
      probability: 15
    },
    {
      name: "明皇弈棋图",
      probability: 10
    },
    {
      name: "忒PANDA·赛博",
      probability: 0.1
    },
    {
      name: "雪景寒林图",
      probability: 1
    },
    {
      name: "青铜面具",
      probability: 1
    },
    {
      name: "隶书道德经",
      probability: 1
    },
    {
      name: "青铜扭头跪坐人像",
      probability: 1
    },
    {
      name: "猴猫图",
      probability: 1
    },
    {
      name: "鼓吹骑俑",
      probability: 3.1
    },
    {
      name: "蜀川胜概图",
      probability: 3
    },
    {
      name: "虎钮如意云纹青玉握",
      probability: 3
    },
    {
      name: "双凤瓜棱盒",
      probability: 16
    }
  ]
};
if (location.href.includes("https://ershisi.ccmgip.com/24solar/replaceBlind")) {
  const blindId = new URLSearchParams(location.search).get("id");
  const blindData = replaceBlindDetails[blindId];
  let totalValue = null;
  const nfts = await useNfts();
  if (!blindData) {
    console.log("未找到盲盒数据");
  } else {
    totalValue = blindData.reduce((acc, e) => {
      const nftData = nfts.byName[e.name];
      if (!nftData) {
        console.log(`未找到藏品数据: ${e.name}`);
        return acc;
      }
      return acc + nftData.on_sale_lowest_price * e.probability / 1e4;
    }, 0);
    console.log(`盲盒价值期望: ${totalValue.toFixed(2)}`);
  }
  const container = await dynamicQueryAsync(
    '[class^="replaceBlind_condition-box"]'
  );
  const items = await waitForElements('[class^="replaceBlind_displace-item"]');
  const processedItems = [];
  items.forEach((item) => {
    const nameElement = item.querySelector(
      '[class^="replaceBlind_displace-name"]'
    );
    if (!nameElement)
      return;
    const name = nameElement.textContent.trim().slice(0, -2);
    const nftData = nfts.byName[name];
    if (!nftData) {
      console.log(`未找到藏品数据: ${name}`);
      return;
    }
    const onSalePrice = nftData.on_sale_lowest_price / 100;
    const priceSpan = document.createElement("span");
    priceSpan.className = "on-sale-price";
    priceSpan.style.fontSize = "12px";
    priceSpan.style.display = "inline-block";
    priceSpan.style.color = "#ff9900";
    priceSpan.style.marginLeft = "5px";
    priceSpan.textContent = onSalePrice;
    nameElement.appendChild(priceSpan);
    processedItems.push({
      element: item,
      price: onSalePrice
    });
  });
  processedItems.sort((a, b) => a.price - b.price);
  const subtitleElement = document.querySelector(
    '[class^="replaceBlind_subtitle"]'
  );
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
  if (subtitleElement) {
    container.appendChild(subtitleElement.cloneNode(true));
  }
  processedItems.forEach((item) => {
    container.appendChild(item.element);
  });
  console.log("藏品已按市场最低价排序完成");
  const blindContent = document.querySelector('[class^="replaceBlind_blind-content"]') || container;
  let consumeCount = null;
  let consumeValue = null;
  if (subtitleElement) {
    consumeCount = subtitleElement.textContent.match(/\d+/g)[0];
    const consumeItems = processedItems.slice(0, consumeCount);
    consumeValue = consumeItems.reduce((acc, item) => acc + item.price, 0);
    const consumeElement = document.createElement("div");
    consumeElement.className = "consume-value";
    consumeElement.style.fontSize = "16px";
    consumeElement.style.color = "#ff9900";
    consumeElement.style.marginTop = "10px";
    consumeElement.textContent = `置换成本: ${consumeValue.toFixed(2)}`;
    blindContent.appendChild(consumeElement);
  }
  if (totalValue) {
    const valueExpectationElement = document.createElement("div");
    valueExpectationElement.className = "value-expectation";
    valueExpectationElement.style.fontSize = "16px";
    valueExpectationElement.style.color = "#ff9900";
    valueExpectationElement.style.marginTop = "10px";
    valueExpectationElement.textContent = `盲盒价值期望: ${totalValue.toFixed(
      2
    )}`;
    blindContent.appendChild(valueExpectationElement);
    if (consumeCount && consumeValue) {
      const profitElement = document.createElement("div");
      profitElement.className = "profit-value";
      profitElement.style.fontSize = "16px";
      profitElement.style.color = "#ff9900";
      profitElement.style.marginTop = "10px";
      const profitValue = totalValue * consumeCount - consumeValue;
      profitElement.textContent = `置换收益: ${profitValue.toFixed(2)}`;
      blindContent.appendChild(profitElement);
    }
  }
}
GM_addStyle(`
._helperText {
    color: #ff9900;
    white-space: pre-wrap;
}
`);
{
  const nfts = await useNfts();
  foreverQuery("._normalItem_uqw8m_13", (item) => {
    if (item.isProcessed)
      return;
    item.isProcessed = true;
    const name = item.children[1].textContent.trim();
    const nftData = nfts.byName[name];
    if (!nftData) {
      console.log(`未找到藏品数据: ${name}`);
      return;
    }
    const onSalePrice = nftData.on_sale_lowest_price / 100;
    const l2Price = nftData.l2_lowest_price / 100;
    const lastestPrice = nftData.l2_lastest_price / 100;
    const text = [
      `市售价 ${onSalePrice}`,
      l2Price === 0 ? "" : `合约价 ${l2Price} (${(onSalePrice / l2Price).toFixed(2)} x)`,
      `最新成交价 ${lastestPrice} (${(onSalePrice / lastestPrice).toFixed(
        2
      )} x)`
    ].filter((e) => e !== "").join("\n");
    item.insertAdjacentHTML(
      "beforeend",
      `<span class="_helperText">${text}</span>`
    );
  });
}

})();
