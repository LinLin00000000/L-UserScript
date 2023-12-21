import { hideElements, globalConfig, dynamicQuery } from './utils'
import { build } from 'usbuild'

await build({ ...globalConfig, match: ['https://hexdocs.pm/*'] })

dynamicQuery('.sidebar-projectVersion', hideElements)
