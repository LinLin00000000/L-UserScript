import { hideElements, progressiveQuery } from './utils'

const selectors = ['#HMRichBox', '[data-balloon="画中画"]']

progressiveQuery(selectors, hideElements)
