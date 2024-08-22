declare global {
    interface Window {
        unsafeWindow: Window
    }
}

const win = globalThis?.unsafeWindow || globalThis

const CACHE_KEY = '_usbuild_HMR'
export const restoreActions: Function[] = win[CACHE_KEY] ? win[CACHE_KEY] : (win[CACHE_KEY] = [])

export function restore() {
    restoreActions.reverse()
    restoreActions.forEach(f => f())
    restoreActions.length = 0
}

// 安装脚本时先执行一次 restore，保证重复安装时可以自动还原
restore()

const RESTORE_FUNTION_KEY = '_usbuild_restore_function'
export const restoreFunctions: Function[] = win[RESTORE_FUNTION_KEY] ? win[RESTORE_FUNTION_KEY] : (win[RESTORE_FUNTION_KEY] = [])

function unhook() {
    restoreFunctions.forEach(f => f())
    restoreFunctions.length = 0
}

// 工具库开发期间自动还原，如果仅仅开发脚本则不需要自动把 hook 函数还原
unhook()

const hooked = restoreFunctions.length > 0

export const createElement = hooked ? document.createElement :
    function createElement(...args: Parameters<typeof document.createElement>): ReturnType<typeof document.createElement> {
        const e = document.createElement(...args)
        restoreActions.push(() => {
            e.remove()
        })
        return e
    }

function genExports1<Name extends string, T = genT<Name>, R = ReturnType<genT<Name>>>(functionName: Name, f: (e: R) => void) {
    const parentName = functionName.split('.').slice(0, -1).join('.')
    const parent = getValueByString(parentName)
    const originalFunction = getValueByString(functionName)
    return hooked ? originalFunction : (function (...args) {
        const e = (originalFunction as Function).apply(parent, args)
        f(e)
        return e
    }) as T
}

export const createElement1 = genExports1('document.createElement', (e) => {
    console.log('createElement')
    restoreActions.push(() => {
        e.remove()
    })
})

export const insertAdjacentHTML = genExports1('Element.prototype.insertAdjacentHTML', (e) => {
    console.log('insertAdjacentHTML')
})

// const aa = createElement1('p')

export function useHook() {
    if (!hooked) {
        const originalCreateElement = document.createElement
        restoreFunctions.push(() => document.createElement = originalCreateElement)
        document.createElement = function (...args: Parameters<typeof document.createElement>): ReturnType<typeof document.createElement> {
            const e = originalCreateElement.apply(this, args)
            restoreActions.push(() => {
                e?.remove()
            })
            return e
        }

        const originalInsertAdjacentHTML = Element.prototype.insertAdjacentHTML
        restoreFunctions.push(() => Element.prototype.insertAdjacentHTML = originalInsertAdjacentHTML)
        Element.prototype.insertAdjacentHTML = function (...args: Parameters<typeof Element.prototype.insertAdjacentHTML>) {
            const parent = this as Element

            // Capture the state before modification
            const snapshot = parent.cloneNode(true)

            // Perform the actual insertion
            originalInsertAdjacentHTML.apply(this, args)

            // Store the action with a function closure capturing the current parent and its snapshot
            restoreActions.push(() => {
                parent?.parentNode?.replaceChild(snapshot, parent)
            })
        }
    }
}

type genT<T extends string, P = typeof globalThis> = T extends `${infer First}.${infer Rest}`
    ? (First extends keyof P
        ? genT<Rest, P[First]>
        : never)
    : (T extends ""
        ? P
        : (T extends keyof P
            ? P[T]
            : never))

export function getValueByString<T extends string>(path: T) {
    return (path ? path.split('.') : []).reduce((acc, part) => acc && acc[part], globalThis) as genT<T>
}

// const a = getValueByString('document.createElement')
// const b = a('div')

export function setValueByString(path: string, value: any) {
    const parts = path.split('.')
    const lastPart = parts.pop()
    if (lastPart === undefined) return

    const lastObject = parts.reduce((acc, part) => acc && acc[part], globalThis)

    if (lastObject) {
        lastObject[lastPart] = value
        return value
    }
}
