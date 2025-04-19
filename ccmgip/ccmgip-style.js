import { mybuild } from '../utils'

await mybuild(
  {
    match: ['https://*.ccmgip.com/*'],
  },
  {
    dev: false,
  }
)

GM_addStyle(`
    ._normalItem_uqw8m_13, ._item_1bhkg_23 {
        width: 42vw !important;
    }
    ._item_1bhkg_23 {
        margin-right: 1vw !important;
    }
`)
