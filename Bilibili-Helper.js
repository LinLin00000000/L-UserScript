import { dynamicQuery, mybuild } from './utils'
await mybuild(
    {
        match: ['https://www.bilibili.com/*'],
    },
    {
        // dev: true,
    }
)

// 自动宽屏播放
dynamicQuery(".bpx-player-ctrl-wide", e => e.click())
