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
import fs from 'fs/promises'

const { log } = console
const outdir = 'dist'

const DEV = process.env.NODE_ENV === 'DEV'

const ctxsResult = await Promise.allSettled(
    userScripts.map(script => {
        return esbuild.context({
            entryPoints: [script.fileName],
            bundle: true,
            outdir,
            outExtension: { '.js': '.user.js' },
            banner: {
                js: bannerBuilder(script) + '\nconst DEV = ' + DEV + ';\n',
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

    // 不是 DEV 模式的话不需要保持开发服务器一直在线
    // 所以需要定时以结束进程
    setTimeout(() => {
        process.exit(0)
    }, 3000)
}

async function installScripts() {
    const extension = DEV ? '.meta.user.js' : '.user.js'
    return await Promise.allSettled(
        userScripts.map(async script => {
            const jsFile = modifyFileExtension(script.fileName, extension)
            const tmpFile = modifyFileExtension(script.fileName, 'html')
            const tmpFilePath = path.join(outdir, tmpFile)
            const htmlContent = `<script>location.href = './${jsFile}'; window.close()</script>`

            await fs.writeFile(tmpFilePath, htmlContent)
            await open(tmpFilePath)
            
            setTimeout(() => fs.unlink(tmpFilePath), 2000)
        })
    )
}
