import { defineConfig } from 'vite'
import monkey from 'vite-plugin-monkey'
import { userScripts } from '../UserScript.config'
import { getDirname } from '../utils'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        monkey({
            entry: 'src/main.js',
            userscript: userScripts[getDirname(import.meta)],
        }),
    ],
})
