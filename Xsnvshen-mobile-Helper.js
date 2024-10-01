import { dynamicQuery, foreverQuery, mybuild } from './utils'
await mybuild(
  {
    match: ['http*://m.xsnvshen.co/album/*', 'http*://m.xsnvshen.com/album/*'],
  },
  {
    dev: true,
    outdir: 'pub',
  }
)

function getImgNumber() {
  let result = document.evaluate(
    "//em/text()[contains(., '共')]/following-sibling::span[1]/text()",
    document,
    null,
    XPathResult.STRING_TYPE,
    null
  )

  // 将结果转换为整数
  const imgNumber = parseInt(result.stringValue, 10)
  return imgNumber
}

setTimeout(() => {
  dynamicQuery('#arcbox', e => {
    const imgNumber = getImgNumber()
    const img = e.lastElementChild
    // const originalHTML = img.outerHTML
    const originalHTML = img.outerHTML.replace(/\s*lazy\s*/g, 'nolazy')
    const result = []
    const actions = []

    for (let i = 10; i < 15; i++) {
      const nextImgHTML = originalHTML.replace(
        /\d{3}(?=\.jpg)/g,
        i.toString().padStart(3, '0')
      )
      // e.insertAdjacentHTML('beforeend', nextImgHTML)
      result.push(nextImgHTML)
    }

    const allImgHTML = result.join('\n')
    // img.insertAdjacentHTML('afterend', allImgHTML)

    const button = document.createElement('button')
    button.textContent = '显示全部图片'
    button.onclick = () => {
      // img.insertAdjacentHTML('afterend', allImgHTML)
      for (const nextImgHTML of result) {
        e.insertAdjacentHTML('beforeend', nextImgHTML)
      }

      button.remove()
    }
    e.insertAdjacentElement('afterend', button)
  })
}, 2000)
