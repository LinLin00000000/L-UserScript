import { dynamicQuery, foreverQuery, mybuild } from './utils'
await mybuild(
  {
    match: ['http*://*.xsnvshen.co/album/*', 'http*://*.xsnvshen.com/album/*'], // 更新 match 匹配的 URL
  },
  {
    dev: false,
    outdir: 'pub',
  }
)

foreverQuery('ul.gallery li.swl-item', e => {
  e.style.width = '100%'
})
