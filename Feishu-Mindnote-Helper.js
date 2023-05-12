import { hideElements, progressiveQuery } from './utils'

const selectors = [
    '.mindmap',
    '.mindnote-minder-comment',
    '.gpf-biz-help-center__trigger-button-box',
]

progressiveQuery(selectors, hideElements)
