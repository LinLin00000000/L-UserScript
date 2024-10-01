import { ll } from './ll-utils'
import { mybuild } from './utils'
import * as utils from './utils'

await mybuild({
  description: "LinLin's web debug utils",
  match: ['*://*/*'],
})

unsafeWindow.ll = ll

const exportKeys = ['dynamicQuery', 'foreverQuery', 'textQuery']

exportKeys.forEach(key => {
  unsafeWindow[key] = utils[key]
})
