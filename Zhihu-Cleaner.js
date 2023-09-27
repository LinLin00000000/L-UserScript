import {
    CSSJustifyCenter,
    debug,
    pollingQuery,
    progressiveQuery,
    removeElement,
    switchPath,
} from './utils'

// 通用规则，每个页面都适用

// 如果出错了，则自动刷新页面
progressiveQuery('.ErrorPage', _ => location.reload())

// 问题页面
switchPath('question', () => {
    debug('question page')

    // 默认不展开全部回答
    // if (location.pathname.includes('/answer')) {
    //     location.pathname = location.pathname.split('/answer')[0]
    // }

    // 默认展开问题详情
    // progressiveQuery('.QuestionRichText-more', e => e.click())

    // 将知乎 logo 导航到知乎发现，因为知乎首页需要登录
    progressiveQuery(
        '[aria-label="知乎"]',
        e => (e.href = 'https://www.zhihu.com/explore')
    )

    progressiveQuery(
        '.AppHeader-Tabs, .AppHeader-userInfo, .QuestionButtonGroup',
        removeElement
    )
    progressiveQuery('.SearchBar', e => (e.style['max-width'] = '80%'))

    // 删除回答侧边栏
    progressiveQuery('.Question-sideColumn', removeElement)

    // 将回答区域设为 90% 宽带并居中
    progressiveQuery('.Question-main', CSSJustifyCenter)
    progressiveQuery('.Question-mainColumn', e => (e.style.width = '90%'))

    // 隐藏关注按钮，轮询查询防止新的回答出现新的关注按钮
    pollingQuery('.FollowButton', removeElement)

    // 轮询删除收藏、喜欢、回复按钮
    pollingQuery('.Button--withIcon', e => {
        if (
            e.textContent.trim().includes('收藏') ||
            e.textContent.includes('喜欢') ||
            e.textContent.includes('回复')
        ) {
            e.remove()
        }
    })
})

// 专栏页面
switchPath('p', () => {
    debug('column page')

    progressiveQuery(
        '.ColumnPageHeader-Wrapper, .Post-SideActions',
        removeElement
    )

    progressiveQuery('.RichContent-actions button', (e, i) => {
        if (i > 3) {
            e.remove()
        }
    })

    pollingQuery('.Button--withIcon', e => {
        if (e.textContent.includes('喜欢') || e.textContent.includes('回复')) {
            e.remove()
        }
    })
})

// 搜索页面
switchPath('search', () => {
    debug('search page')

    // 将知乎 logo 导航到知乎发现，因为知乎首页需要登录
    progressiveQuery(
        '[aria-label="知乎"]',
        e => (e.href = 'https://www.zhihu.com/explore')
    )

    progressiveQuery('.AppHeader-Tabs, .AppHeader-userInfo', removeElement)
    progressiveQuery('.SearchBar', e => (e.style['max-width'] = '80%'))
    progressiveQuery('.SearchTabs-inner', CSSJustifyCenter)

    // 删除侧边栏
    progressiveQuery('.SearchMain + div', removeElement)

    // 将搜索结果区域设为 90% 宽带并居中
    progressiveQuery('.Search-container', CSSJustifyCenter)
    progressiveQuery('.SearchMain', e => (e.style.width = '90%'))
})
