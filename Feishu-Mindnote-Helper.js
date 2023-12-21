import { hideElements, globalConfig, dynamicQuery } from './utils'
import { build } from 'usbuild'
await build({
    ...globalConfig,
    description:
        'Hide some useless elements in Feishu Mindnote page, make it clean and tidy.',
    match: ['https://linlin00.feishu.cn/mindnotes/EwaGbXd70mcocjnqRu9cbDO7nOc'],
    icon: 'https://www.google.com/s2/favicons?sz=64&domain=feishu.cn',
})

const selectors = [
    '.mindmap',
    '.mindnote-minder-comment',
    '.gpf-biz-help-center__trigger-button-box',
]

dynamicQuery(selectors, hideElements)
