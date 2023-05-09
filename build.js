import * as esbuild from 'esbuild'
import { userScripts } from './UserScript.config.js'

Promise.allSettled(
    userScripts.map(script => {
        return esbuild.build({
            entryPoints: [`./${script.fileName}.js`],
            bundle: true,
            outdir: 'dist',
            banner: {
                js: `// ==UserScript==
// @name         ${script.name}
// @namespace    ${script.namespace}
// @author       ${script.author}
// @version      ${script.version}
// @description  ${script.description}
// @license      ${script.license}
// @source       ${script.source}
// @grant        ${script.grant || 'none'}
${script.icon ? `// @icon         ${script.icon}` : ''}
${
    script.matches?.length
        ? script.matches.map(match => `// @match        ${match}`).join('\n')
        : ''
}
// ==/UserScript==
`,
            },
        })
    })
)

// await esbuild.build({
//     entryPoints: ['test.js'],
//     bundle: true,
//     // write: true,
//     outdir: 'dist',
//     banner: {
//         js: '// qaq\n',
//     },
// })

console.log('build done')
