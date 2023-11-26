import { modifyFileExtension } from './utils'

const globalConfig = {
    namespace: 'L-UserScript',
    version: '0.1.0',
    author: 'Lin',
    license: 'MIT License',
    source: 'https://github.com/LinLin00000000/L-UserScript',
    description: "Lin's userscript. 喵~",
}

const userScriptConfig = [
    {
        fileName: 'Debug-Utils.js',
        skip: true,
        description: "LinLin's web debug utils",
        match: ['*://*/*'],
        grant: ['unsafeWindow'],
    },
    {
        fileName: 'Feishu-Mindnote-Helper.js',
        skip: true,
        description:
            'Hide some useless elements in Feishu Mindnote page, make it clean and tidy.',
        match: [
            'https://linlin00.feishu.cn/mindnotes/EwaGbXd70mcocjnqRu9cbDO7nOc',
        ],
        icon: 'https://www.google.com/s2/favicons?sz=64&domain=feishu.cn',
    },
    {
        fileName: 'YHDM-Player-Helper.js',
        skip: true,
        match: ['*.ntdm8.com/*', '*.mxdm9.com/*', 'danmu.yhdmjx.com/*'],
    },
    {
        fileName: 'Zhihu-Cleaner.js',
        skip: true,
        match: ['https://*.zhihu.com/*'],
    },
    {
        fileName: 'Hexdocs-Helper.js',
        skip: true,
        match: ['https://hexdocs.pm/*']
    }
]

export const userScripts = userScriptConfig
    .filter(e => !e.skip)
    .map(script => {
        const name =
            script.name ||
            modifyFileExtension(script.fileName.replace(/-/g, ' '))

        const scriptConfig = {
            name,
            ...globalConfig,
            ...script,
        }

        return scriptConfig
    })
