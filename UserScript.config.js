const globalConfig = {
    namespace: 'L-UserScript',
    version: '0.1.0',
    author: 'Lin',
    license: 'MIT License',
    source: 'https://github.com/LinLin00000000/L-UserScript',
}

const userScriptConfig = [
    {
        fileName: 'Feishu-Mindnote-Helper.js',
        description:
            'Hide some useless elements in Feishu Mindnote page, make it clean and tidy.',
        matches: [
            'https://linlin00.feishu.cn/mindnotes/EwaGbXd70mcocjnqRu9cbDO7nOc',
        ],
        icon: 'https://www.google.com/s2/favicons?sz=64&domain=feishu.cn',
    },
    {
        fileName: 'test.js',
        description: 'test',
    },
]

export const userScripts = userScriptConfig.map(script => {
    const scriptConfig = {
        ...globalConfig,
        ...script,
    }

    scriptConfig.name =
        scriptConfig.name || fileNameCoverter(scriptConfig.fileName)

    return scriptConfig
})

/**
 * @param {string} fileName
 */
function fileNameCoverter(fileName) {
    return fileName.replace(/-/g, ' ').replace(/\.js$/, '')
}
