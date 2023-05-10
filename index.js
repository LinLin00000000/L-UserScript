import { build as ViteBuild, preview, createServer } from 'vite'
import monkey from 'vite-plugin-monkey'
import { userScripts } from './UserScript.config'
import { processFileName } from './utils'

const commandMap = {
    dev,
    mount,
}

const [, , command, ...files] = process.argv

if (!commandMap[command]) {
    console.error('command not found')
    process.exit()
}

const configs = files
    .filter(file => userScripts[processFileName(file)])
    .map(file => ({
        plugins: [
            monkey({
                entry: file,
                userscript: userScripts[processFileName(file)],
                build: {
                    fileName: `${processFileName(file)}.user.js`,
                },
            }),
        ],
        build: {
            emptyOutDir: false,
        },
    }))

await Promise.allSettled(configs.map(commandMap[command]))

if (command === 'mount') {
    await mounting(configs[0])
    setTimeout(() => {
        console.log('✨install success!')
        process.exit()
    }, 1000)
}

async function dev(config) {
    const server = await createServer(config)
    await server.listen()
    server.printUrls()
}

async function mount(config) {
    await ViteBuild(config)
}

async function mounting(config) {
    await preview(config)
}
