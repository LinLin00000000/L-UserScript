import { dynamicQuery, mybuild } from './utils'

await mybuild(
  {
    match: ['https://www.edclub.com/sportal/*'],
  },
  {
    // dev: true,
  }
)

// Handle Ctrl + L shortcut
document.addEventListener('keydown', event => {
  if (event.ctrlKey && event.key === 'l') {
    event.preventDefault()
    dynamicQuery('.edicon-refresh, .navbar-goback', element => {
      element.click()
    })
  }
})
