import { dynamicQuery, globalConfig } from './utils'

import { build } from 'usbuild'

await build(
    {
        ...globalConfig,
        match: ['https://tarkov-market.com/maps/*'],
    },
    {
        // dev: true,
        outdir: 'publish',
    }
)

let input

dynamicQuery('div.page-content', parent => {
    setInterval(() => {
        const e = parent.querySelector(
            'div.panel_top.d-flex > div > input[type=text]'
        )
        if (e === null) {
            dynamicQuery(
                'div.panel_top.d-flex > div > button',
                e => setTimeout(() => e.click(), 500),
                {
                    parent,
                }
            )
            dynamicQuery(
                'div.panel_top.d-flex > div > input[type=text]',
                e => {
                    input = e
                },
                {
                    parent,
                }
            )
        }
    }, 2000)
})

const host = '127.0.0.1'
const port = 7543

const eventSource = new EventSource(`http://${host}:${port}/map`)
eventSource.onmessage = function (event) {
    // 解析服务器发送的数据
    const data = event.data

    // 在控制台打印消息
    console.log('Received message:', data)
    if (input) {
        input.value = data
        input.dispatchEvent(
            new Event('input', { bubbles: true, cancelable: true })
        )
    }
}
