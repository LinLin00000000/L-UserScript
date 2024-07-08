import {
    dynamicQuery,
    isEmptyString,
    mybuild,
    textQuery,
    onUrlChange,
} from './utils'

await mybuild(
    {
        match: ['panter.aizex.cn/*', 'aizex.net/*'],
    },
    {
        dev: true,
    }
)

if (location.host.includes('panter.aizex.cn')) {
    // 对话页面

    // 如果未登录，则会有一个全局的重定向方法，用于重定向到首页
    setTimeout(() => {
        if (window.redirectToHomePage) {
            redirectToHomePage()
        }
    }, 1000)

    // 自动选择团队空间
    dynamicQuery(
        '[role="dialog"]',
        e =>
            e.lastElementChild.firstElementChild.firstElementChild.firstElementChild.click(),
        { timeout: 2000 }
    )
} else if (location.href.includes('https://aizex.net')) {
    // 共享池页面

    setTimeout(() => {
        // 如果未登录，首页会有一个登录/注册按钮
        window.a = textQuery('登录/注册')
        if (a.length > 0) {
            a[0].click()
        } else {
            // 这是已登录的情况
            onUrlChange(url => {
                // console.log('URL changed to:', url)
                if (url === 'https://aizex.net/plusPool') {
                    // console.log('Executing function...')
                    setTimeout(() => {
                        window.a = textQuery('Team')
                        a[0].click()
                        setTimeout(() => {
                            location.href = 'https://panter.aizex.cn/'
                        }, 2000)
                    }, 1000)
                }
            })
        }
    }, 1000)
}
