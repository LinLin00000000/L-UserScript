import {
    hideElements,
    isEmptyString,
    dynamicQuery,
    removeElement,
    addClass,
    addMessageListener,
    send,
    mybuild,
} from './utils'

await mybuild(
    {
        match: [
            'www.mxdm.com/*',
            'www.mxdm1.com/*',
            'www.mxdm2.com/*',
            'www.mxdm3.com/*',
            'www.mxdm4.com/*',
            'www.mxdm5.com/*',
            'www.mxdm6.com/*',
            'www.mxdm7.com/*',
            'www.mxdm8.com/*',
            'www.mxdm9.com/*',

            'www.mxdm.cc/*',
            'www.mxdm1.cc/*',
            'www.mxdm2.cc/*',
            'www.mxdm3.cc/*',
            'www.mxdm4.cc/*',
            'www.mxdm5.cc/*',
            'www.mxdm6.cc/*',
            'www.mxdm7.cc/*',
            'www.mxdm8.cc/*',
            'www.mxdm9.cc/*',

            'www.mxdm.fans',
            'www.mxdm1.fans',
            'www.mxdm2.fans',
            'www.mxdm3.fans',
            'www.mxdm4.fans',
            'www.mxdm5.fans',
            'www.mxdm6.fans',
            'www.mxdm7.fans',
            'www.mxdm8.fans',
            'www.mxdm9.fans',

            'danmu.yhdmjx.com/*',
            'bgm.tv/*',
        ],
        require: ['https://cdn.jsdelivr.net/npm/@unocss/runtime'],
    },
    {
        // dev: true,
    }
)

const LELEPLAYER_SPEED = 'leleplayer-data-speed'
const BGM_URL_MAP = 'bgm-url'

const selectors = ['#HMRichBox', '[data-balloon="画中画"]']

dynamicQuery(selectors, hideElements)

// yhdm 播放源
if (location.host.includes('danmu.yhdmjx.com')) {
    dynamicQuery('#bofang', e => {
        e.insertAdjacentHTML(
            'afterend',
            `<button class="leleplayer-icon leleplayer-play-icon" id="next-video"><svg class="squirtle-svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22"><path d="M16 5a1 1 0 00-1 1v4.615a1.431 1.431 0 00-.615-.829L7.21 5.23A1.439 1.439 0 005 6.445v9.11a1.44 1.44 0 002.21 1.215l7.175-4.555a1.436 1.436 0 00.616-.828V16a1 1 0 002 0V6C17 5.448 16.552 5 16 5z"></path></svg></button>`
        )
        dynamicQuery('#next-video', e =>
            e.addEventListener('click', () => {
                send('nextVideo')
            })
        )
    })

    dynamicQuery(['.speed-stting > [data-speed]'], e => {
        e.addEventListener('click', event => {
            const speed =
                event.target.dataset?.speed ??
                event.target.parentNode?.dataset?.speed
            localStorage.setItem(LELEPLAYER_SPEED, speed)
        })
    })

    if (!isEmptyString(localStorage.getItem(LELEPLAYER_SPEED))) {
        dynamicQuery(
            [
                `.speed-stting > [data-speed='${localStorage.getItem(
                    LELEPLAYER_SPEED
                )}']`,
            ],
            e => e.click()
        )
    }
}

// bangumi
else if (location.host.includes('bgm.tv')) {
    dynamicQuery('h1.nameSingle', e => {
        const saveButton = document.createElement('button')
        saveButton.textContent = 'Save URL 📥'
        saveButton.addEventListener('click', () =>
            send({ [BGM_URL_MAP]: location.href })
        )
        e.appendChild(saveButton)
    })

    dynamicQuery('#browserItemList', e => {
        if (e.childElementCount === 1) {
            const url = e.firstElementChild.firstElementChild.href
            if (!isEmptyString(url)) {
                send({
                    [BGM_URL_MAP]: e.firstElementChild.firstElementChild.href,
                })
                location.href = url
            }
        }
    })

    // 自动暗黑模式
    dynamicQuery('#toggleTheme', e => {
        if (e.text.includes('关灯')) {
            e.click()
        }
    })
}

// 套壳网站
else {
    dynamicQuery('.scroll-content > .selected', e => {
        const url = e?.nextElementSibling?.href
        if (!isEmptyString(url)) {
            addMessageListener((message, e) => {
                if (message === 'nextVideo') {
                    window.location.href = url
                }
            }, 'https://danmu.yhdmjx.com')
        }
    })

    dynamicQuery('.fixed_right_bar', removeElement)

    dynamicQuery('.player-block', e => {
        const iframe = document.createElement('iframe')
        iframe.src =
            JSON.parse(localStorage.getItem(BGM_URL_MAP))?.[vod_name] ??
            `https://bgm.tv/subject_search/${vod_name}?cat=2`

        addClass(iframe, 'w-full h-[1000px] mt-8')
        e.appendChild(iframe)

        addMessageListener((message, e) => {
            console.log(message)
            if (message[BGM_URL_MAP]) {
                const bgmURLMap =
                    JSON.parse(localStorage.getItem(BGM_URL_MAP)) ?? {}
                bgmURLMap[vod_name] = message[BGM_URL_MAP]
                localStorage.setItem(BGM_URL_MAP, JSON.stringify(bgmURLMap))
            }
        }, 'https://bgm.tv')
    })
}
