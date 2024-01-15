import {
    CSSJustifyCenter,
    removeElement,
    switchPath,
    dynamicQuery,
    foreverQuery,
    mybuild,
} from './utils'

await mybuild(
    {
        match: ['https://*.zhihu.com/*'],
    },
    {
        // dev: true,
        enableLocalFileRequireInDev: true,
    }
)

// 通用规则，每个页面都适用

// 轮询检查如果出错了，则自动刷新页面
foreverQuery('.ErrorPage', _ => location.reload())

// 移除标题的私信提醒
setInterval(() => {
    if (document.title.includes('私信')) {
        document.title = document.title.replace(/\(\d+ 封私信\) /, '')
    }
}, 1000)

// 问题页面
switchPath('question', () => {
    // 默认展开问题详情
    // dynamicQuery('.QuestionRichText-more', e => e.click())

    // 将知乎 logo 导航到知乎发现，因为知乎首页需要登录
    dynamicQuery(
        '[aria-label="知乎"]',
        e => (e.href = 'https://www.zhihu.com/explore')
    )

    dynamicQuery(
        '.AppHeader-Tabs, .AppHeader-userInfo, .QuestionButtonGroup',
        removeElement
    )
    dynamicQuery('.SearchBar', e => (e.style['max-width'] = '80%'))

    // 删除回答侧边栏
    foreverQuery('.Question-sideColumn', e => {
        e.remove()
        // 将回答区域设为 90% 宽带并居中
        dynamicQuery('.Question-main', CSSJustifyCenter)
        dynamicQuery('.Question-mainColumn', e => (e.style.width = '90%'))
        dynamicQuery('.ListShortcut', e => (e.style.width = '100%'))
    })

    // 隐藏关注按钮，轮询查询防止新的回答出现新的关注按钮
    foreverQuery('.FollowButton', removeElement)

    // 轮询删除收藏、喜欢、回复按钮
    foreverQuery('.Button--withIcon', e1 => {
        if (
            e1.textContent.trim().includes('收藏') ||
            e1.textContent.includes('喜欢') ||
            e1.textContent.includes('回复')
        ) {
            removeElement(e1)
        }
    })
})

// 专栏页面
switchPath('p', () => {
    dynamicQuery('.ColumnPageHeader-Wrapper, .Post-SideActions', removeElement)

    dynamicQuery('.RichContent-actions button', (e, i) => {
        if (i > 3) {
            e.remove()
        }
    })

    foreverQuery('.Button--withIcon', e => {
        if (e.textContent.includes('喜欢') || e.textContent.includes('回复')) {
            e.remove()
        }
    })
})

// 搜索页面
switchPath('search', () => {
    // 将知乎 logo 导航到知乎发现，因为知乎首页需要登录
    dynamicQuery(
        '[aria-label="知乎"]',
        e => (e.href = 'https://www.zhihu.com/explore')
    )

    dynamicQuery('.AppHeader-Tabs, .AppHeader-userInfo', removeElement)
    dynamicQuery('.SearchBar', e => (e.style['max-width'] = '80%'))
    dynamicQuery('.SearchTabs-inner', CSSJustifyCenter)

    // 删除侧边栏
    dynamicQuery('.SearchMain + div', removeElement)

    // 将搜索结果区域设为 90% 宽带并居中
    dynamicQuery('.Search-container', CSSJustifyCenter)
    dynamicQuery('.SearchMain', e => (e.style.width = '90%'))
})
