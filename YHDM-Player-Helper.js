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

            'www.mxdm.fans/*',
            'www.mxdm1.fans/*',
            'www.mxdm2.fans/*',
            'www.mxdm3.fans/*',
            'www.mxdm4.fans/*',
            'www.mxdm5.fans/*',
            'www.mxdm6.fans/*',
            'www.mxdm7.fans/*',
            'www.mxdm8.fans/*',
            'www.mxdm9.fans/*',

            'www.mxdm.xyz/*',
            'www.mxdm1.xyz/*',
            'www.mxdm2.xyz/*',
            'www.mxdm3.xyz/*',
            'www.mxdm4.xyz/*',
            'www.mxdm5.xyz/*',
            'www.mxdm6.xyz/*',
            'www.mxdm7.xyz/*',
            'www.mxdm8.xyz/*',
            'www.mxdm9.xyz/*',

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
    // TypeError: Cannot set property log of [object Object] which has only a getter
    // console.log = console.table

    // 鼠标中键全屏
    document.addEventListener('mousedown', function (event) {
        if (event.button === 1) {
            fullScreen()
        }
    })

    function fullScreen() {
        dynamicQuery('.leleplayer-full-icon', e => e.click())
    }

    // 滚轮控制快进快退
    document.addEventListener('wheel', function (event) {
        // 检测滚轮的方向
        if (event.deltaY < 0) {
            // 滚轮向上，模拟按键“左”
            simulateKeyPress('ArrowLeft')
        } else if (event.deltaY > 0) {
            // 滚轮向下，模拟按键“右”
            simulateKeyPress('ArrowRight')
        }
    })

    function simulateKeyPress(key) {
        // 根据 key 参数，决定 keyCode
        const keyToKeyCode = {
            ArrowLeft: 37,
            ArrowRight: 39,
            Enter: 13,
            // 可以根据需要继续添加更多键值对
        }

        // 创建一个新的键盘事件
        let event = new KeyboardEvent('keydown', {
            key: key, // 传递键名
            code: key, // 传递键名作为 code
            keyCode: keyToKeyCode[key], // 使用映射表查找对应的 keyCode
            which: keyToKeyCode[key], // 同上，对于 which 使用同样的值
            bubbles: true, // 允许事件冒泡
            cancelable: true, // 允许取消事件
        })

        // 触发事件
        document.dispatchEvent(event)
    }

    dynamicQuery('#bofang', e => {
        e.insertAdjacentHTML(
            'afterend',
            `<button class="leleplayer-icon leleplayer-refresh-icon" id="refresh-video">
                <svg viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
                    <path d="m23.8995816 10.3992354c0 .1000066-.1004184.1000066-.1004184.2000132 0 0 0 .1000066-.1004184.1000066-.1004184.1000066-.2008369.2000132-.3012553.2000132-.1004184.1000066-.3012552.1000066-.4016736.1000066h-6.0251046c-.6025105 0-1.0041841-.4000264-1.0041841-1.00006592 0-.60003954.4016736-1.00006591 1.0041841-1.00006591h3.5146443l-2.8117154-2.60017136c-.9037657-.90005932-1.9079498-1.50009886-3.0125523-1.90012523-2.0083682-.70004614-4.2175733-.60003954-6.12552305.30001977-2.0083682.90005932-3.41422594 2.50016478-4.11715481 4.5002966-.20083682.50003295-.80334728.80005275-1.30543933.60003954-.50209205-.10000659-.80334728-.70004613-.60251046-1.20007909.90376569-2.60017136 2.71129707-4.60030318 5.12133891-5.70037568 2.41004184-1.20007909 5.12133894-1.30008569 7.63179914-.40002637 1.4058578.50003296 2.7112971 1.30008569 3.7154812 2.40015819l3.0125523 2.70017795v-3.70024386c0-.60003955.4016736-1.00006591 1.0041841-1.00006591s1.0041841.40002636 1.0041841 1.00006591v6.00039545.10000662c0 .1000066 0 .2000132-.1004184.3000197zm-3.1129707 3.7002439c-.5020921-.2000132-1.1046025.1000066-1.3054394.6000396-.4016736 1.1000725-1.0041841 2.200145-1.9079497 3.0001977-1.4058578 1.5000989-3.5146444 2.3001516-5.623431 2.3001516-2.10878662 0-4.11715482-.8000527-5.72384938-2.4001582l-2.81171548-2.6001714h3.51464435c.60251046 0 1.0041841-.4000263 1.0041841-1.0000659 0-.6000395-.40167364-1.0000659-1.0041841-1.0000659h-6.0251046c-.10041841 0-.10041841 0-.20083682 0s-.10041841 0-.20083682 0c0 0-.10041841 0-.10041841.1000066-.10041841 0-.20083682.1000066-.20083682.2000132s0 .1000066-.10041841.1000066c0 .1000066-.10041841.1000066-.10041841.2000132v.2000131.1000066 6.0003955c0 .6000395.40167364 1.0000659 1.0041841 1.0000659s1.0041841-.4000264 1.0041841-1.0000659v-3.7002439l2.91213389 2.8001846c1.80753138 2.0001318 4.31799163 3.0001977 7.02928871 3.0001977 2.7112971 0 5.2217573-1.0000659 7.1297071-2.9001911 1.0041841-1.0000659 1.9079498-2.3001516 2.4100418-3.7002439.1004185-.6000395-.2008368-1.2000791-.7029288-1.3000857z"/>
                </svg>
            </button>`
        )
        dynamicQuery('#refresh-video', e =>
            e.addEventListener('click', () => {
                location.reload()
            })
        )

        e.insertAdjacentHTML(
            'afterend',
            `<button class="leleplayer-icon leleplayer-play-icon" id="next-video">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22">
                    <path d="M16 5a1 1 0 00-1 1v4.615a1.431 1.431 0 00-.615-.829L7.21 5.23A1.439 1.439 0 005 6.445v9.11a1.44 1.44 0 002.21 1.215l7.175-4.555a1.436 1.436 0 00.616-.828V16a1 1 0 002 0V6C17 5.448 16.552 5 16 5z"></path>
                </svg>
            </button>`
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
            `https://bgm.tv/subject_search/${removeSuffix(vod_name)}?cat=2`

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

// 疑似 bangumi 搜索引擎bug
function removeSuffix(str) {
    return str.endsWith('版') ? str.slice(0, -1) : str
}
