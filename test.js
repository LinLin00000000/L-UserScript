import { build as ViteBuild, preview, createServer } from 'vite'
import monkey from 'vite-plugin-monkey'
import { userScripts } from './UserScript.config.js'
import { processFileName } from './utils.js'

const commandMap = {
    dev,
    build,
    mount,
}

// const [, , command, ...files] = process.argv
const command = 'mount'
const files = ['./Feishu-Mindnote-Helper.js']

if (!commandMap[command]) {
    console.error('command not found')
    process.exit()
}

const queue = files
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
        }
    }))
    // .map(commandMap[command])
    .map(file => () => commandMap[command](file))

for await (const fn of queue) {
    await fn()
}
// await Promise.allSettled(queue)

async function dev(config) {
    const server = await createServer(config)
    await server.listen()
    server.printUrls()
}

async function build(config) {
    await ViteBuild(config)
}

async function mount(config) {
    // await ViteBuild(config)
    const server = await preview(config)
    // server.printUrls()
    setTimeout(() => {
        console.log('✨install success!')
        process.exit()
    }, 1000)
}
