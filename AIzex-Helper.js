import { dynamicQuery, isEmptyString, mybuild, textQuery } from './utils'

await mybuild(
    {
        match: ['panter.aizex.cn/*', 'aizex.net/*'],
    },
    {
        // dev: true,
    }
)

if (location.host.includes('panter.aizex.cn')) {
    setTimeout(() => {
        if (window.redirectToHomePage) {
            redirectToHomePage()
        }
    }, 1000)
} else if (location.href.includes('https://aizex.net')) {
    setTimeout(() => {
        window.a = textQuery('登录/注册')
        if (a.length > 0) {
            a[0].click()
        } else {
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

function onUrlChange(callback) {
    // 初始调用，检查当前 URL 是否符合条件
    callback(window.location.href)

    // 监听 `popstate` 事件
    window.addEventListener('popstate', () => {
        callback(window.location.href)
    })

    // 覆盖 `pushState` 和 `replaceState` 方法，以便监听 URL 变化
    const originalPushState = history.pushState
    const originalReplaceState = history.replaceState

    history.pushState = function () {
        originalPushState.apply(history, arguments)
        callback(window.location.href)
    }

    history.replaceState = function () {
        originalReplaceState.apply(history, arguments)
        callback(window.location.href)
    }
}
