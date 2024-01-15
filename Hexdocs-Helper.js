import { hideElements, dynamicQuery, mybuild } from './utils'

await mybuild({ match: ['https://hexdocs.pm/*'] })

dynamicQuery('.sidebar-projectVersion', hideElements)
