const globalConfig = {
    namespace: 'L-UserScript',
    version: '0.1.0',
    author: 'Lin',
    license: 'MIT License',
    source: 'https://github.com/LinLin00000000/L-UserScript',
}

const userScriptConfig = {
    'Feishu Mindnote Helper': {
        description:
            'Hide some useless elements in Feishu Mindnote page, make it clean and tidy.',
        match: [
            'https://linlin00.feishu.cn/mindnotes/EwaGbXd70mcocjnqRu9cbDO7nOc',
        ],
        icon: 'https://www.google.com/s2/favicons?sz=64&domain=feishu.cn',
    },
    'NTDM Helper': {
        match: ['*.ntdm8.com/*', 'danmu.yhdmjx.com/*'],
    },
    test: {
        fileName: 'test.js',
        description: 'test',
    },
}

const userScripts = {}
for (const [name, config] of Object.entries(userScriptConfig)) {
    userScripts[name] = {
        ...globalConfig,
        name,
        source: `${globalConfig.source}/tree/main/${name}/src/main.js`,
        ...config,
    }
}

export { userScripts }
