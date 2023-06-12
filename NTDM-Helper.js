import { hideElements, initMessageEmitter, progressiveQuery } from './utils'

const selectors = ['#HMRichBox', '[data-balloon="画中画"]']

progressiveQuery(selectors, hideElements)

const url =
    document.querySelector('.active-play')?.parentNode?.nextElementSibling
        ?.firstElementChild?.href

let messageEmitter
if (url) {
    messageEmitter = initMessageEmitter('parent', {
        trustedOrigin: 'https://danmu.yhdmjx.com',
        targetSelector: '#playleft > iframe',
    })
    messageEmitter.addListener((message, e) => {
        if (message === 'nextVideo') {
            window.location.href = url
        }
    })
} else {
    messageEmitter = initMessageEmitter('child', {
        targetOrigin: 'https://www.ntdm8.com',
    })
}
console.log(`origin: ${window.location.origin} messageEmitter initialized`)

progressiveQuery(['#container > p'], e => {
    e.insertAdjacentHTML(
        'beforebegin',
        `<button type="button" id="debug" >debug</button>`
    )
    document.querySelector('#debug').onclick = () => {
        console.log('debug')
    }
})

progressiveQuery(['#bofang'], e => {
    e.insertAdjacentHTML(
        'afterend',
        `<button class="leleplayer-icon leleplayer-play-icon" id="next-video"><svg class="squirtle-svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22"><path d="M16 5a1 1 0 00-1 1v4.615a1.431 1.431 0 00-.615-.829L7.21 5.23A1.439 1.439 0 005 6.445v9.11a1.44 1.44 0 002.21 1.215l7.175-4.555a1.436 1.436 0 00.616-.828V16a1 1 0 002 0V6C17 5.448 16.552 5 16 5z"></path></svg></button>`
    )
    document.querySelector('#next-video').addEventListener('click', () => {
        messageEmitter.emitMessage('nextVideo')
    })
})
