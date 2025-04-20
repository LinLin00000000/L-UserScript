// ==UserScript==
// @name         cqb
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
          processors?.forEach(([s, f2]) => {
            if (e.matches(s)) {
              f2(e);
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
    const removeAllProcessor = () => processors.every((f2) => f2());
    if (timeout >= 0) {
      setTimeout(() => {
        removeAllProcessor();
        onTimeout();
      }, timeout);
    }
    return removeAllProcessor;
  };
})();
var foreverQuery = (s, f2, o) => dynamicQuery(s, f2, { once: false, ...o });

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

// cqb.js
await mybuild(
  {
    match: ["https://*.ccmgip.com/*"],
    version: "0.1.0"
  },
  {
    dev: false,
    outdir: "pub"
  }
);
globalThis.f = (s, d) => [...s].map((e) => e !== "0" ? parseInt(e) : 11).forEach((i) => {
  if (d && d.children[i - 1]) {
    d.children[i - 1].click();
  } else {
    console.error("未找到元素 d 或其子元素，索引：", i);
  }
});
var debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(void 0, args);
    }, delay);
  };
};
globalThis.qb = async () => {
  console.log("执行 qb，开始查找元素...");
  try {
    const elements = await waitForElements('[class^="_items"]');
    console.log(`waitForElements 找到 ${elements.length} 个元素。`);
    const d = elements.at(-1);
    console.log("找到 d:", d);
    if (d) {
      f("000000", d);
      console.log("qb：已在元素 d 上执行 f 函数。");
    } else {
      console.error('qb：未找到目标元素 d (最后一个匹配 [class^="_items"] 的元素)。');
    }
  } catch (error) {
    console.error("qb：执行 waitForElements 或后续操作时出错:", error);
  }
};
var qbDebounceDelay = 500;
var debouncedQb = debounce(qb, qbDebounceDelay);
var startPolling = () => {
  console.log("开始轮询检查元素 b...");
  let isKeyboardVisible = false;
  const checkElementB = async () => {
    const b = [...document.querySelectorAll('[class^="_keyboard"]')].at(-1);
    const currentlyVisible = b && b.style.display === "block";
    if (currentlyVisible && !isKeyboardVisible) {
      console.log("轮询检查：元素 b 变为可见 (display: block)。触发 debouncedQb...");
      debouncedQb();
      isKeyboardVisible = true;
    } else if (!currentlyVisible && isKeyboardVisible) {
      console.log("轮询检查：元素 b 变为不可见。");
      isKeyboardVisible = false;
    }
  };
  setInterval(checkElementB, qbDebounceDelay);
};
startPolling();
foreverQuery("._active_1yyur_328, ._jumpBtn_9mtdp_191", (e) => {
  if (e.isProcessed)
    return;
  e.isProcessed = true;
  e.click();
});

})();
