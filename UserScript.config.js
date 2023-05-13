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
        fileName: 'NTDM-Helper.js',
        match: ['*.ntdm8.com/*', 'danmu.yhdmjx.com/*'],
    },
]

export const userScripts = userScriptConfig
    .filter(e => !e.skip)
    .map(script => {
        const scriptConfig = {
            ...globalConfig,
            ...script,
        }

        scriptConfig.name =
            scriptConfig.name ||
            modifyFileExtension(script.fileName.replace(/-/g, ' '))

        return scriptConfig
    })
