import * as utils from './utils'

const ll = utils.dynamicQuery
for (const key in utils) {
  ll[key] = utils[key]
}

ll.test = () => {
  console.log('这是 LinLin 的开发工具箱')
}

ll.exportAll = () => {
  for (const key in utils) {
    unsafeWindow[key] = utils[key]
  }
}

export { ll }
