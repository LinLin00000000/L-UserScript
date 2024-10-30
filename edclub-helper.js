import { dynamicQuery, mybuild } from './utils'
await mybuild({
  match: ['https://www.edclub.com/sportal/*'],
})

// Example functionality: Log a message on page load
dynamicQuery('body', () => {
  console.log('EdClub Helper script loaded!')
})
