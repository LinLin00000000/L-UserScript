const env = {}

export default { ...env, ...(await import('./env.local').catch(() => {})) }
