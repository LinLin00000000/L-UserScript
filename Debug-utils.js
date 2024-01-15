import { dynamicQuery, foreverQuery, globalConfig, mybuild } from './utils'
await mybuild({
    description: "LinLin's web debug utils",
    match: ['*://*/*'],
    grant: ['unsafeWindow'],
})

const ll = dynamicQuery
ll.dynamicQuery = dynamicQuery
ll.foreverQuery = foreverQuery

ll.test = () => {
    console.log('这是 LinLin 的开发工具箱')
}

unsafeWindow.ll = ll
