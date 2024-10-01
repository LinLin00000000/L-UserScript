// ==UserScript==
// @name         Xsnvshen Helper
// @namespace    L-UserScript
// @version      0.1.0
// @author       Lin
// @license      MIT License
// @source       https://github.com/LinLin00000000/L-UserScript
// @description  Lin's userscript. 喵~
// @match        http*://www.xsnvshen.co/album/*
// @match        http*://www.xsnvshen.com/album/*
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
  return function(selector, callback = console.log, options = {}) {
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
      const result = all ? parent.querySelectorAll(selector2) : [parent.querySelector(selector2)].filter((e) => e !== null);
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

// ll-utils.js
var ll = dynamicQuery;
ll.dynamicQuery = dynamicQuery;
ll.foreverQuery = foreverQuery;
ll.textQuery = textQuery;
ll.test = () => {
  console.log("这是 LinLin 的开发工具箱");
};

// 这是力量的代价，不可避免 :)
function __usbuild() {
}

// utils.ts
function hideElements(element) {
  element.style.display = "none";
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
function textQuery(text) {
  const xpath = `//*[contains(text(), '${text}')]`;
  const result = document.evaluate(
    xpath,
    document,
    null,
    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
    null
  );
  const elements = [];
  for (let i = 0; i < result.snapshotLength; i++) {
    const elem = result.snapshotItem(i);
    if (elem instanceof HTMLElement) {
      elements.push(elem);
    }
  }
  return elements;
}

// Xsnvshen-Helper.js
await mybuild(
  {
    match: [
      "http*://www.xsnvshen.co/album/*",
      "http*://www.xsnvshen.com/album/*"
    ]
  },
  {
    dev: false,
    outdir: "pub"
  }
);
var style = document.createElement("style");
style.innerHTML = `
    .showlists li {
        width: 100% !important;
        height: auto !important;
        padding: 0 !important;
        border-right: none !important;
        border-bottom: none !important;
    }

    .swl-item .swi-hd {
        display: initial !important;
        width: auto !important;
        height: auto !important;
    }

    .showlists img {
        width: 100% !important;
        max-width: none !important;
        max-height: none !important;
    }
`;
document.head.appendChild(style);
dynamicQuery(".workContentWrapper", hideElements);
dynamicQuery(".showlists", (e) => {
  e.style.display = "block";
});

})();
