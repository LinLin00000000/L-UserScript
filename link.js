import lnk from 'lnk'
import { userScripts } from './UserScript.config'

await Promise.allSettled(Object.keys(userScripts).map(async fileName => {
    lnk(`./${fileName}/src/main.js`, '.', { rename: `${fileName}.js` })
}))

console.log('link done')
