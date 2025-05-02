import {
  dynamicQuery,
  dynamicQueryAsync,
  foreverQuery,
  monitorApiRequests,
  mybuild,
  sleep,
  useStore,
  waitForElements,
} from './utils'
import { dataManagerInit, useNfts } from './ccmgipDataManager'

await mybuild(
  {
    match: ['https://*.ccmgip.com/*'],
    version: '0.8.1',
  },
  {
    dev: false,
    outdir: 'pub',
  }
)

const { log } = console

dataManagerInit()
unsafeWindow ||= globalThis
unsafeWindow.orderStore = useStore('orderStore', {})

// 捐助活动页面
if (
  location.href.includes('https://ershisi.ccmgip.com/24solar/donationActivity')
) {
  const nfts = await useNfts()
  const container = await dynamicQueryAsync(
    '[class^="donationActivity_box-content"]'
  )
  const items = await waitForElements(
    '[class^="donationActivity_donationItem"]'
  )

  const processedItems = []

  // 为每个项目计算和添加价格比例
  items.forEach(item => {
    const nameElement = item.querySelector('[class^="donationActivity_row2"]')
    if (!nameElement) return

    const name = nameElement.textContent.trim()
    const nftData = nfts.byName[name]

    if (!nftData) {
      log(`未找到藏品数据: ${name}`)
      return
    }

    const onSalePrice = nftData.on_sale_lowest_price / 100

    const pointsElement = item.querySelector(
      '[class^="donationActivity_points"]'
    )

    if (pointsElement) {
      let ratio = '无法计算'
      let ratioValue = Infinity

      const pointValue = parseFloat(
        pointsElement.textContent.replace(/[^0-9.]/g, '')
      )
      if (isNaN(pointValue)) {
        log(`无法解析积分值: ${pointsElement.textContent}`)
        return
      }

      // const l2Price = pointValue / 100
      const l2Price = nftData.l2_lowest_price / 100

      if (l2Price && l2Price > 0) {
        ratioValue = onSalePrice / l2Price
        ratio = `${onSalePrice} / ${l2Price} = ${ratioValue.toFixed(2)}`
      } else {
        ratio = `${onSalePrice} / 0 = ∞`
      }

      const ratioSpan = document.createElement('span')
      ratioSpan.className = 'price-ratio'
      ratioSpan.style.fontSize = '12px'
      ratioSpan.style.display = 'block'
      ratioSpan.style.color = '#ff9900'
      ratioSpan.style.marginLeft = '5px'
      ratioSpan.textContent = ratio

      pointsElement.appendChild(ratioSpan)

      // 存储项目和比率值用于排序
      processedItems.push({
        element: item,
        ratioValue: ratioValue,
      })
    }
  })

  // 按比率排序
  processedItems.sort((a, b) => a.ratioValue - b.ratioValue)

  // 先添加回馈积分提示(如果存在)
  const subtitleElement = document.querySelector(
    '[class^="donationActivity_subtitle"]'
  )

  // 清空容器并按新顺序添加项目
  while (container.firstChild) {
    container.removeChild(container.firstChild)
  }

  if (subtitleElement) {
    container.appendChild(subtitleElement.cloneNode(true))
  }

  // 添加排序后的项目
  processedItems.forEach(item => {
    container.appendChild(item.element)
  })

  log('藏品已按价格比例排序完成')
}

const replaceBlindDetails = {
  // 盲盒置换特别活动九
  '0195f977-54f1-4bf3-b12c-f7efb6c043ec': [
    {
      name: '树色平远图',
      probability: 15.0,
    },
    {
      name: '鱼石图',
      probability: 15.0,
    },
    {
      name: '汉宫观潮图',
      probability: 15.0,
    },
    {
      name: '花鸟图',
      probability: 15.0,
    },
    {
      name: '调琴啜茗图',
      probability: 15.0,
    },
    {
      name: '忒PANDA·复古',
      probability: 0.1,
    },
    {
      name: '雪景寒林图',
      probability: 0.5,
    },
    {
      name: '青铜面具',
      probability: 0.5,
    },
    {
      name: '杂花图',
      probability: 0.5,
    },
    {
      name: '隶书道德经',
      probability: 0.5,
    },
    {
      name: '青铜扭头跪坐人像',
      probability: 0.5,
    },
    {
      name: '猴猫图',
      probability: 0.5,
    },
    {
      name: '武侯高卧图',
      probability: 1.0,
    },
    {
      name: '倪宽赞',
      probability: 0.5,
    },
    {
      name: '象尊',
      probability: 0.5,
    },
    {
      name: '鎏金犀牛',
      probability: 1.0,
    },
    {
      name: '鼓吹骑俑',
      probability: 0.9,
    },
    {
      name: '蜀川胜概图',
      probability: 1.0,
    },
    {
      name: '虎钮如意云纹青玉握',
      probability: 3.0,
    },
    {
      name: '白釉划花褐彩牡丹纹瓷腰圆枕',
      probability: 4.0,
    },
    {
      name: '瑶岛仙真图',
      probability: 5.0,
    },
    {
      name: '蜀山行旅图',
      probability: 5.0,
    },
  ],
  // 盲盒置换六十七
  '019569e1-4d7f-4965-b3e7-b68c2ce8f30a': [
    {
      name: '树色平远图',
      probability: 15.0,
    },
    {
      name: '鱼石图',
      probability: 15.0,
    },
    {
      name: '汉宫观潮图',
      probability: 15.0,
    },
    {
      name: '花鸟图',
      probability: 15.0,
    },
    {
      name: '明皇弈棋图',
      probability: 10.0,
    },
    {
      name: '忒PANDA·赛博',
      probability: 0.1,
    },
    {
      name: '雪景寒林图',
      probability: 1,
    },
    {
      name: '青铜面具',
      probability: 1,
    },
    {
      name: '隶书道德经',
      probability: 1,
    },
    {
      name: '青铜扭头跪坐人像',
      probability: 1,
    },
    {
      name: '猴猫图',
      probability: 1,
    },
    {
      name: '鼓吹骑俑',
      probability: 3.1,
    },
    {
      name: '蜀川胜概图',
      probability: 3,
    },
    {
      name: '虎钮如意云纹青玉握',
      probability: 3.0,
    },
    {
      name: '双凤瓜棱盒',
      probability: 16,
    },
  ],
  // 盲盒置换六十六
  '01954583-24a5-47e3-8ed3-6a5863fabc5d': [
    {
      name: '树色平远图',
      probability: 15.0,
    },
    {
      name: '鱼石图',
      probability: 15.0,
    },
    {
      name: '汉宫观潮图',
      probability: 15.0,
    },
    {
      name: '花鸟图',
      probability: 15.0,
    },
    {
      name: '明皇弈棋图',
      probability: 10.0,
    },
    {
      name: '忒PANDA·赛博',
      probability: 0.1,
    },
    {
      name: '千里江山图',
      probability: 0.2,
    },
    {
      name: '步辇图',
      probability: 0.5,
    },
    {
      name: '韩熙载夜宴图',
      probability: 0.2,
    },
    {
      name: '五牛图',
      probability: 0.2,
    },
    {
      name: '清明上河图',
      probability: 0.2,
    },
    {
      name: '唐宫仕女图-虢国夫人游春图',
      probability: 0.5,
    },
    {
      name: '雪景寒林图',
      probability: 0.5,
    },
    {
      name: '青铜面具',
      probability: 0.5,
    },
    {
      name: '乾隆款黄釉青花莲托寿碗',
      probability: 0.5,
    },
    {
      name: '隶书道德经',
      probability: 0.5,
    },
    {
      name: '青铜扭头跪坐人像',
      probability: 0.5,
    },
    {
      name: '猴猫图',
      probability: 0.5,
    },
    {
      name: '二马图',
      probability: 1,
    },
    {
      name: '杜秋图',
      probability: 5,
    },
    {
      name: '鼓吹骑俑',
      probability: 1,
    },
    {
      name: '剔红山水人物纹瓶',
      probability: 1,
    },
    {
      name: '上苑春游图',
      probability: 5,
    },
    {
      name: '鸭形铜砚滴',
      probability: 5.3,
    },
    {
      name: '三彩折枝牡丹纹枕',
      probability: 5,
    },
    {
      name: '蜀川胜概图',
      probability: 1,
    },
    {
      name: '虎钮如意云纹青玉握',
      probability: 1,
    },
  ],
  // 盲盒置换七十二
  '01968491-623f-46d7-a4b6-8db296d3d9b1': [
    { name: '洗象图', probability: 15.0 },
    { name: '九龙山居图', probability: 15.0 },
    { name: '海棠春秋图', probability: 15.0 },
    { name: '花鸟图', probability: 15.0 },
    { name: '调琴啜茗图', probability: 15.0 },
    { name: '忒PANDA·国风', probability: 0.1 },
    { name: '忒PANDA·赛博', probability: 0.1 },
    { name: '忒PANDA·复古', probability: 0.1 },
    { name: '千里江山图', probability: 0.5 },
    { name: '步辇图', probability: 0.5 },
    { name: '韩熙载夜宴图', probability: 0.5 },
    { name: '五牛图', probability: 0.5 },
    { name: '清明上河图', probability: 0.5 },
    { name: '唐宫仕女图-虢国夫人游春图', probability: 0.5 },
    { name: '青铜面具', probability: 0.4 },
    { name: '杂花图', probability: 0.5 },
    { name: '北宋泥塑彩绘菩萨立像', probability: 0.5 },
    { name: '隶书道德经', probability: 0.5 },
    { name: '青铜扭头跪坐人像', probability: 0.5 },
    { name: '猴猫图', probability: 0.5 },
    { name: '倪宽赞', probability: 1.0 },
    { name: '象尊', probability: 1.0 },
    { name: '鎏金犀牛', probability: 1.0 },
    { name: '八花图', probability: 1.0 },
    { name: '江山万里图', probability: 1.0 },
    { name: '“范仲淹印”玉龟纽印', probability: 1.0 },
    { name: '前赤壁赋', probability: 1.0 },
    { name: '虎钮如意云纹青玉握', probability: 2.0 },
    { name: '花鸟草虫图', probability: 1.0 },
    { name: '铜刺猬', probability: 3.0 },
    { name: '三彩胡人抱罐骑马俑', probability: 3.0 },
    { name: '辋川别墅图', probability: 3.0 },
  ],
}

// 置换活动
if (location.href.includes('https://ershisi.ccmgip.com/24solar/replaceBlind')) {
  const blindId = new URLSearchParams(location.search).get('id')
  const blindData = replaceBlindDetails[blindId]
  let totalValue = null
  const nfts = await useNfts()

  if (!blindData) {
    log('未找到盲盒数据')
  } else {
    // 计算盲盒价值期望
    totalValue = blindData.reduce((acc, e) => {
      const nftData = nfts.byName[e.name]
      if (!nftData) {
        log(`未找到藏品数据: ${e.name}`)
        return acc
      }
      return acc + (nftData.on_sale_lowest_price * e.probability) / 10000
    }, 0)
    log(`盲盒价值期望: ${totalValue.toFixed(2)}`)
  }

  const container = await dynamicQueryAsync(
    '[class^="replaceBlind_condition-box"]'
  )
  const items = await waitForElements('[class^="replaceBlind_displace-item"]')
  const processedItems = []

  // 为每个项目添加市场最低价
  items.forEach(item => {
    const nameElement = item.querySelector(
      '[class^="replaceBlind_displace-name"]'
    )
    if (!nameElement) return

    const name = nameElement.textContent.trim().slice(0, -2)
    const nftData = nfts.byName[name]

    if (!nftData) {
      log(`未找到藏品数据: ${name}`)
      return
    }

    const onSalePrice = nftData.on_sale_lowest_price / 100

    const l2Price = nftData.l2_lowest_price / 100
    const liquidCount = nftData.liquid_count

    const text = [
      onSalePrice,
      l2Price
        ? `合约${l2Price} (${(onSalePrice / l2Price).toFixed(2)}x)`
        : null,
      `流通${liquidCount}`,
    ]
      .filter(e => e !== null)
      .join(' | ')

    const priceSpan = document.createElement('span')
    priceSpan.className = 'on-sale-price'
    priceSpan.style.fontSize = '12px'
    priceSpan.style.display = 'inline-block'
    priceSpan.style.color = '#ff9900'
    priceSpan.style.marginLeft = '5px'
    priceSpan.textContent = text
    nameElement.appendChild(priceSpan)

    // 存储项目和价格用于排序
    processedItems.push({
      element: item,
      price: onSalePrice,
    })
  })

  // 按价格排序
  processedItems.sort((a, b) => a.price - b.price)

  // 先添加回馈积分提示(如果存在)
  const subtitleElement = document.querySelector(
    '[class^="replaceBlind_subtitle"]'
  )

  // 清空容器并按新顺序添加项目
  while (container.firstChild) {
    container.removeChild(container.firstChild)
  }

  if (subtitleElement) {
    container.appendChild(subtitleElement.cloneNode(true))
  }

  // 添加排序后的项目
  processedItems.forEach(item => {
    container.appendChild(item.element)
  })
  log('藏品已按市场最低价排序完成')

  // 添加成本和收益提示
  const blindContent =
    document.querySelector('[class^="replaceBlind_blind-content"]') || container

  // 添加置换成本
  let consumeCount = null
  let consumeValue = null
  let blindCount = null

  const blindRuleElement = document.querySelector(
    '[class^="replaceBlind_rule-card"]'
  )
  const blindRuleText = blindRuleElement?.textContent?.trim()
  const match = blindRuleText?.match(/任意不同的(\d+)份来置换(\d+)份/)

  if (match) {
    consumeCount = parseInt(match[1])
    blindCount = parseInt(match[2])
  }

  if (subtitleElement) {
    // 计算前 consumeCount 个最低价藏品价值之和

    const consumeItems = processedItems.slice(0, consumeCount)
    consumeValue = consumeItems.reduce((acc, item) => acc + item.price, 0)

    const consumeElement = document.createElement('div')
    consumeElement.className = 'consume-value'
    consumeElement.style.fontSize = '16px'
    consumeElement.style.color = '#ff9900'
    consumeElement.style.marginTop = '10px'
    consumeElement.textContent = `置换成本: ${consumeValue.toFixed(2)}`

    blindContent.appendChild(consumeElement)
  }

  // 添加盲盒价值期望
  if (totalValue) {
    const valueExpectationElement = document.createElement('div')
    valueExpectationElement.className = 'value-expectation'
    valueExpectationElement.style.fontSize = '16px'
    valueExpectationElement.style.color = '#ff9900'
    valueExpectationElement.style.marginTop = '10px'
    valueExpectationElement.textContent = `盲盒价值期望: ${totalValue.toFixed(
      2
    )}`

    blindContent.appendChild(valueExpectationElement)

    // 添加收益提示
    if (consumeCount && consumeValue && blindCount) {
      const profitElement = document.createElement('div')
      profitElement.className = 'profit-value'
      profitElement.style.fontSize = '16px'
      profitElement.style.color = '#ff9900'
      profitElement.style.marginTop = '10px'
      const profitValue = totalValue * blindCount - consumeValue
      profitElement.textContent = `置换收益: ${profitValue.toFixed(2)}`

      blindContent.appendChild(profitElement)
    }
  }
}

GM_addStyle(`
._helperText {
    color: #ff9900;
    white-space: pre-wrap;
}
`)

// 藏品浏览
;(async () => {
  const nfts = await useNfts()
  const orders = orderStore.value

  foreverQuery('._normalItem_uqw8m_13', item => {
    if (item.isProcessed) return
    item.isProcessed = true
    const name = item.children[1].textContent.trim()
    const nftData = nfts.byName[name]
    if (!nftData) {
      log(`未找到藏品数据: ${name}`)
      return
    }
    const onSalePrice = nftData.on_sale_lowest_price / 100
    const l2Price = nftData.l2_lowest_price / 100
    const lastestPrice = nftData.l2_lastest_price / 100

    let buyPrice = null
    let offerPrice = null

    const nftOrders = orders[name]
    if (nftOrders) {
      const { offer, ...buys } = nftOrders
      if (offer) {
        offerPrice = offer / 100
      }

      // 计算均价
      const buysCount = Object.keys(buys).length
      if (buysCount > 0) {
        const buysSum = Object.values(buys).reduce((acc, e) => acc + e, 0)
        buyPrice = buysSum / buysCount / 100
      }
    }

    const text = [
      `市售价 ${onSalePrice} (${(onSalePrice * 0.95).toFixed(2)})`,
      l2Price === 0
        ? ''
        : `合约价 ${l2Price} (${(onSalePrice / l2Price).toFixed(2)} x)`,
      `新成交 ${lastestPrice} (${(onSalePrice / lastestPrice).toFixed(2)} x)`,
      buyPrice
        ? `买入均 ${buyPrice.toFixed(2)} (${(onSalePrice / buyPrice).toFixed(2)} x)`
        : '',
      // offerPrice
      //   ? `已寄售 ${offerPrice} (${(onSalePrice / offerPrice).toFixed(2)} x)`
      //   : '',
      `市流通 ${nftData.on_sale_count}/${nftData.liquid_count} (${(
        (nftData.on_sale_count / nftData.liquid_count) *
        100
      ).toFixed(2)}%)`,
    ]
      .filter(e => e !== '')
      .join('\n')

    item.insertAdjacentHTML(
      'beforeend',
      `<span class="_helperText">${text}</span>`
    )
  })
})()

// 专题浏览
;(async () => {
  const nfts = await useNfts()
  foreverQuery('._list_1uodg_269, ._list_swvyv_174', list => {
    const items = list.children
    for (const item of items) {
      const parentElement = item.firstChild
      const nameElement = parentElement?.querySelector(
        '[class^="_nameUserHoldTagContainer"], ._titleBox_swvyv_195'
      )

      if (!nameElement || nameElement.isProcessed) continue
      nameElement.isProcessed = true

      const name = nameElement?.firstChild?.textContent?.trim()
      if (!name) continue

      let showOnSalePrice = true
      if (nameElement.className.includes('_titleBox_swvyv_195')) {
        showOnSalePrice = false
      }

      let onSalePrice
      let l2Price
      let lastestPrice
      let onSaleCount = null
      let liquidCount = null

      const nftData = nfts.byName[name]
      if (nftData) {
        onSalePrice = nftData.on_sale_lowest_price / 100
        l2Price = nftData.l2_lowest_price / 100
        lastestPrice = nftData.l2_lastest_price / 100
        onSaleCount = nftData.on_sale_count
        liquidCount = nftData.liquid_count

        const userHold = parseInt(nameElement.lastChild.textContent.trim())
        if (userHold > 0) {
          const url = `https://art.ccmgip.com/collection/list?id=${nftData.id}&type=nft&title=${encodeURIComponent(
            nftData.name
          )}`

          // Create a button element
          const detailsButton = document.createElement('button')
          detailsButton.textContent = '查看藏品'
          detailsButton.className = '_helperText'
          detailsButton.style.cursor = 'pointer'
          detailsButton.addEventListener('click', event => {
            event.stopPropagation()
            event.preventDefault()
            location.href = url
          })
          parentElement.appendChild(detailsButton)
        }
      } else {
        // 名字不匹配，可能是分类名
        const nftDatas = nfts.byCategoryAndName[name]
        if (!nftDatas) {
          // 都找不到，直接跳过
          log(`未找到藏品数据: ${name}`)
          continue
        }

        // 将 nftDatas 转为列表之后对其中的数据求平均数
        const nftDataList = Object.values(nftDatas)

        onSalePrice = nftDataList.reduce(
          (acc, e) => acc + e.on_sale_lowest_price,
          0
        )
        onSalePrice /= nftDataList.length * 100
        l2Price = nftDataList.reduce((acc, e) => acc + e.l2_lowest_price, 0)
        l2Price /= nftDataList.length * 100
        lastestPrice = nftDataList.reduce(
          (acc, e) => acc + e.l2_lastest_price,
          0
        )
        lastestPrice /= nftDataList.length * 100

        // 寄售量和流通量求和
        onSaleCount = nftDataList.reduce((acc, e) => acc + e.on_sale_count, 0)
        liquidCount = nftDataList.reduce((acc, e) => acc + e.liquid_count, 0)
      }

      const l2PriceIsZero = l2Price === 0
      onSalePrice = onSalePrice.toFixed(2)
      l2Price = l2Price.toFixed(2)
      lastestPrice = lastestPrice.toFixed(2)

      const text = [
        showOnSalePrice
          ? `市售价 ${onSalePrice} (${(onSalePrice * 0.95).toFixed(2)})`
          : '',
        l2PriceIsZero
          ? ''
          : `合约价 ${l2Price} (${(onSalePrice / l2Price).toFixed(2)} x)`,
        `新成交 ${lastestPrice} (${(onSalePrice / lastestPrice).toFixed(2)} x)`,
        onSaleCount !== null && liquidCount !== null
          ? `市流通 ${onSaleCount}/${liquidCount} (${(
              (onSaleCount / liquidCount) *
              100
            ).toFixed(2)}%)`
          : '',
      ]
        .filter(e => e !== '')
        .join('\n')

      parentElement.insertAdjacentHTML(
        'beforeend',
        `<div class="_helperText">${text}</div>`
      )
    }
  })
})()

monitorApiRequests('https://l2-api.ccmgip.com/api/v1/users/me/orders', {
  onResponse: async ({ data, response }) => {
    if (response.status !== 200) return
    log('订单数据:', data)

    const currentOrders = orderStore.value
    let changed = false

    data.forEach(e => {
      const { nftName: name, nfcNumber: number, amount } = e
      log(`购买藏品: ${name}, 编号: ${number}, 价格: ${amount / 100}`)
      currentOrders[name] ||= {}
      if (currentOrders[name][number] !== amount) {
        currentOrders[name][number] = amount
        changed = true
      }
    })

    if (changed) {
      orderStore.value = currentOrders
    }
  },
})

monitorApiRequests('https://l2-api.ccmgip.com/api/v1/users/me/saleorders', {
  onResponse: async ({ data, response }) => {
    if (response.status !== 200) return

    // 寄售订单
    // if (response.responseURL.includes('saleType=offer')) {
    //   log('寄售订单数据:', data)

    //   const currentOrders = orderStore.value
    //   let changed = false

    //   data.forEach(e => {
    //     const { nftName: name, nfcNumber: number, currentPrice } = e
    //     log(`寄售藏品: ${name}, 编号: ${number}, 价格: ${currentPrice / 100}`)
    //     currentOrders[name] ||= {}
    //     if (currentOrders[name][number] !== currentPrice) {
    //       currentOrders[name].offer = currentPrice
    //       changed = true
    //     }
    //   })

    //   if (changed) {
    //     orderStore.value = currentOrders
    //   }
    // }

    // 已出售订单
    if (response.responseURL.includes('saleStatus=sold')) {
      log('出售订单数据:', data)

      const currentOrders = orderStore.value
      let changed = false

      data.forEach(e => {
        const { nftName: name, nfcNumber: number } = e
        log(`已出售藏品: ${name}, 编号: ${number}`)
        // 去除 store 中的已出售订单
        if (currentOrders[name] && currentOrders[name][number] !== undefined) {
          delete currentOrders[name][number]
          // Optional: Clean up empty name entries
          if (Object.keys(currentOrders[name]).length === 0) {
            delete currentOrders[name]
          }
          changed = true
        }
      })

      if (changed) {
        orderStore.value = currentOrders
      }
    }
  },
})

unsafeWindow.nfts = await useNfts()
