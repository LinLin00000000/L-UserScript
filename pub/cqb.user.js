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

})();
