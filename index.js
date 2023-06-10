import {
    bannerBuilder,
    groupBy,
    isEmptyString,
    modifyFileExtension,
} from './utils.js'
import { userScripts } from './UserScript.config.js'
import esbuild from 'esbuild'
import path from 'path'
import open from 'open'

const { log } = console
const outdir = 'dist'

// log(process.env.DEBUG)
const DEV = process.env.NODE_ENV === 'DEV'

const ctxsResult = await Promise.allSettled(
    userScripts.map(script => {
        return esbuild.context({
            entryPoints: [script.fileName],
            bundle: true,
            outdir,
            outExtension: { '.js': '.user.js' },
            banner: {
                js: bannerBuilder(script),
            },
        })
    })
)
const [fulfilled, rejected] = groupBy(
    ctxsResult,
    ctx => ctx.status === 'fulfilled'
)

if (rejected.length) {
    log('rejected', rejected)
}

if (!fulfilled.length) {
    log('no context')
    process.exit(0)
}

const ctxs = fulfilled.map(ctx => ctx.value)

// 随便一个都行，主要是为了起一个服务器
const ctx = ctxs[0]
const { port } = await ctx.serve({
    servedir: 'dist',
})

if (DEV) {
    log(`DEV: ${DEV}`)

    await Promise.allSettled(ctxs.map(ctx => ctx.watch()))
    console.log('✨ watching...')

    // generate Meta File
    const metaGen = userScripts.map(script => {
        const { fileName, require: originRequire } = script
        const extraRequire = `file://${path.resolve(
            outdir,
            modifyFileExtension(fileName, '.user.js')
        )}`
        const require = Array.isArray(originRequire)
            ? [...originRequire, extraRequire]
            : isEmptyString(originRequire)
            ? extraRequire
            : [originRequire, extraRequire]

        return esbuild.build({
            entryPoints: [fileName],
            loader: { '.js': 'empty' },
            outExtension: { '.js': '.meta.user.js' },
            outdir,
            banner: {
                js: bannerBuilder({
                    ...script,
                    require,
                }),
            },
        })
    })
    await Promise.allSettled(metaGen)

    await installScripts()
} else {
    log('🚀 building...')
    await Promise.allSettled(ctxs.map(ctx => ctx.rebuild()))
    log('✨ build done!')

    await installScripts()
    setTimeout(() => {
        process.exit(0)
    }, 3000)
}

async function installScripts() {
    const extension = DEV ? '.meta.user.js' : '.user.js'
    return await Promise.allSettled(
        userScripts
            .map(
                script =>
                    `http://127.0.0.1:${port}/${modifyFileExtension(
                        script.fileName,
                        extension
                    )}`
            )
            .map(open)
    )
}
