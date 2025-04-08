import { dynamicQuery, mybuild } from './utils'
import { dataManagerInit } from './ccmgipDataManager'

await mybuild(
  {
    match: ['https://*.ccmgip.com/*'],
  },
  {
    dev: true,
  }
)

dataManagerInit()

// 捐助活动页面
if (
  location.href.includes('https://ershisi.ccmgip.com/24solar/donationActivity')
) {
  dynamicQuery('[class^="donationActivity_box-content"]', container => {
    waitForElements(
      '[class^="donationActivity_donationItem"]',
      function (items) {
        const itemsArray = Array.from(items)
        const processedItems = []

        // 为每个项目计算和添加价格比例
        itemsArray.forEach(item => {
          const nameElement = item.querySelector(
            '[class^="donationActivity_row2"]'
          )
          if (!nameElement) return

          const name = nameElement.textContent.trim()
          const nftData = ccmgipData.data.find(d => d.name === name)

          if (!nftData) {
            console.log(`未找到藏品数据: ${name}`)
            return
          }

          const onSalePrice = nftData.on_sale_lowest_price / 100
          const l2Price = nftData.l2_lowest_price / 100
          const pointsElement = item.querySelector(
            '[class^="donationActivity_points"]'
          )

          if (pointsElement) {
            let ratio = '无法计算'
            let ratioValue = Infinity

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

        // 清空容器并按新顺序添加项目
        while (container.firstChild) {
          container.removeChild(container.firstChild)
        }

        // 先添加回馈积分提示(如果存在)
        const subtitleElement = document.querySelector(
          '[class^="donationActivity_subtitle"]'
        )
        if (subtitleElement) {
          container.appendChild(subtitleElement.cloneNode(true))
        }

        // 添加排序后的项目
        processedItems.forEach(item => {
          container.appendChild(item.element)
        })

        console.log('藏品已按价格比例排序完成')
      }
    )
  })

  // 等待页面元素加载完成
  function waitForElements(selector, callback, maxTries = 10, interval = 1000) {
    let tries = 0
    const checkExist = setInterval(function () {
      const elements = document.querySelectorAll(selector)
      tries++
      if (elements.length > 0) {
        clearInterval(checkExist)
        callback(elements)
      } else if (tries >= maxTries) {
        clearInterval(checkExist)
        console.log('元素未找到: ' + selector)
      }
    }, interval)
  }
}
