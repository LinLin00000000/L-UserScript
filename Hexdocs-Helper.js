usbuild: {
    const { build } = await import('usbuild')
    await build({ ...globalConfig, match: ['https://hexdocs.pm/*'] })
}

import { hideElements, progressiveQuery, globalConfig } from './utils'

progressiveQuery('.sidebar-projectVersion', hideElements)
