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
._normalItem_uqw8m_13 {
    width: calc(50% - 16px) !important;
}
`)
