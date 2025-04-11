// ==UserScript==
// @name         ccmgip helper
// @namespace    L-UserScript
// @version      0.1.0
// @author       Lin
// @license      MIT License
// @source       https://github.com/LinLin00000000/L-UserScript
// @description  Lin's userscript. 喵~
// @match        https://*.ccmgip.com/*
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

// 这是力量的代价，不可避免 :)
function __usbuild() {
}

// utils.ts
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
function waitForElements(selector, callback, maxTries = 10, interval = 1e3) {
  let tries = 0;
  const checkExist = setInterval(function() {
    const elements = document.querySelectorAll(selector);
    tries++;
    if (elements.length > 0) {
      clearInterval(checkExist);
      callback(elements);
    } else if (tries >= maxTries) {
      clearInterval(checkExist);
      console.log("元素未找到: " + selector);
    }
  }, interval);
}

// ccmgipDataManager.js
var API_URL = "https://data.ccmgip.linlin.world/raw_collections_data?select=id,name,heat,on_sale_lowest_price,l2_lastest_price,liquid_count,l2_lowest_price,on_sale_count,l2_lastest_sale_time&limit=2000";
var STORAGE_KEY = "ccmgip_collection_data";
var REFRESH_KEY = "ccmgip_refresh_status";
var DEFAULT_REFRESH_INTERVAL = 60 * 3;
var MIN_REFRESH_INTERVAL = 10;
var CHECK_FREQUENCY = 5e3;
var MAX_RETRY = 3;
function dataManagerInit() {
  window.ccmgipData = {
    data: [],
    lastUpdatedAt: null,
    refreshInterval: DEFAULT_REFRESH_INTERVAL,
    isLoading: false,
    error: null,
    updateData
  };
  updateGlobalObject();
  checkAndUpdateData();
  setInterval(checkAndUpdateData, CHECK_FREQUENCY);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      checkAndUpdateData();
    }
  });
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY && event.newValue) {
      console.log("[CCMGIP] 数据从另一个标签页更新");
      updateGlobalObject(JSON.parse(event.newValue));
    }
  });
  console.log("[CCMGIP] 数据收集管理器初始化完成");
}
async function fetchData(retryCount = 0) {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`数据获取失败: ${response.statusText}`);
    }
    const data = await response.json();
    console.log(`[CCMGIP] 获取了 ${data.length} 项数据成功`);
    return data;
  } catch (error) {
    console.error(
      `[CCMGIP] 获取数据时出错（尝试 ${retryCount + 1}/${MAX_RETRY} 次）:`,
      error
    );
    if (retryCount < MAX_RETRY - 1) {
      const delay = Math.pow(2, retryCount) * 1e3;
      console.log(`[CCMGIP] ${delay / 1e3} 秒后重试...`);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(fetchData(retryCount + 1));
        }, delay);
      });
    }
    throw error;
  }
}
function getStoredData() {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    return storedData ? JSON.parse(storedData) : null;
  } catch (error) {
    console.error("[CCMGIP] 解析存储数据时出错:", error);
    return null;
  }
}
function storeData(data, refreshInterval = DEFAULT_REFRESH_INTERVAL) {
  const storageData = {
    data,
    lastUpdatedAt: Date.now(),
    refreshInterval: Math.max(refreshInterval, MIN_REFRESH_INTERVAL)
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
  return storageData;
}
function isRefreshNeeded() {
  const storedData = getStoredData();
  if (!storedData)
    return true;
  const now = Date.now();
  const lastUpdate = storedData.lastUpdatedAt;
  const interval = (storedData.refreshInterval || DEFAULT_REFRESH_INTERVAL) * 1e3;
  return now - lastUpdate > interval;
}
function isAnotherTabRefreshing() {
  try {
    const refreshStatus = localStorage.getItem(REFRESH_KEY);
    if (!refreshStatus)
      return false;
    const status = JSON.parse(refreshStatus);
    if (Date.now() - status.timestamp > 3e4) {
      localStorage.removeItem(REFRESH_KEY);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[CCMGIP] 检查刷新状态时出错:", error);
    return false;
  }
}
function setRefreshStatus(isRefreshing) {
  if (isRefreshing) {
    localStorage.setItem(
      REFRESH_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        tabId: Math.random().toString(36).substring(2)
      })
    );
  } else {
    localStorage.removeItem(REFRESH_KEY);
  }
}
function updateGlobalObject(data = null) {
  const storedData = data || getStoredData();
  if (storedData) {
    window.ccmgipData = {
      ...window.ccmgipData,
      data: storedData.data,
      lastUpdatedAt: storedData.lastUpdatedAt,
      refreshInterval: storedData.refreshInterval
    };
  }
}
async function checkAndUpdateData() {
  if (document.hidden) {
    return;
  }
  if (isAnotherTabRefreshing()) {
    updateGlobalObject();
    return;
  }
  if (!isRefreshNeeded()) {
    updateGlobalObject();
    return;
  }
  await updateData();
}
async function updateData() {
  try {
    window.ccmgipData.isLoading = true;
    setRefreshStatus(true);
    const data = await fetchData();
    const refreshInterval = getStoredData()?.refreshInterval || DEFAULT_REFRESH_INTERVAL;
    const updatedData = storeData(data, refreshInterval);
    window.ccmgipData.data = updatedData.data;
    window.ccmgipData.lastUpdatedAt = updatedData.lastUpdatedAt;
    window.ccmgipData.refreshInterval = updatedData.refreshInterval;
    window.ccmgipData.isLoading = false;
    window.ccmgipData.error = null;
    console.log("[CCMGIP] 数据成功更新并存储");
  } catch (error) {
    window.ccmgipData.error = error.message;
    console.error("[CCMGIP] 数据更新失败:", error);
  } finally {
    window.ccmgipData.isLoading = false;
    setRefreshStatus(false);
  }
}

// ccmgip-helper.js
await mybuild(
  {
    match: ["https://*.ccmgip.com/*"]
  },
  {
    dev: false,
    autoReloadMode: "reinstall",
    outdir: "pub"
  }
);
dataManagerInit();
if (location.href.includes("https://ershisi.ccmgip.com/24solar/donationActivity")) {
  dynamicQuery('[class^="donationActivity_box-content"]', (container) => {
    waitForElements(
      '[class^="donationActivity_donationItem"]',
      function(items) {
        const itemsArray = Array.from(items);
        const processedItems = [];
        itemsArray.forEach((item) => {
          const nameElement = item.querySelector(
            '[class^="donationActivity_row2"]'
          );
          if (!nameElement)
            return;
          const name = nameElement.textContent.trim();
          const nftData = ccmgipData.data.find((d) => d.name === name);
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
    );
  });
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
  if (!blindData) {
    console.log("未找到盲盒数据");
  } else {
    totalValue = blindData.reduce((acc, e) => {
      const nftData = ccmgipData.data.find((d) => d.name === e.name);
      if (!nftData) {
        console.log(`未找到藏品数据: ${e.name}`);
        return acc;
      }
      return acc + nftData.on_sale_lowest_price * e.probability / 1e4;
    }, 0);
    console.log(`盲盒价值期望: ${totalValue.toFixed(2)}`);
  }
  dynamicQuery('[class^="replaceBlind_condition-box"]', (container) => {
    waitForElements('[class^="replaceBlind_displace-item"]', (items) => {
      const itemsArray = Array.from(items);
      const processedItems = [];
      itemsArray.forEach((item) => {
        const nameElement = item.querySelector(
          '[class^="replaceBlind_displace-name"]'
        );
        if (!nameElement)
          return;
        const name = nameElement.textContent.trim().slice(0, -2);
        const nftData = ccmgipData.data.find((d) => d.name === name);
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
    });
  });
}

})();
