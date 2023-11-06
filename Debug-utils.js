const ll = (...args) => {
    if (typeof args[0] === 'string') {
        return window.document.querySelectorAll(args[0])
    }
}

ll.test = () => {
    console.log('这是 LinLin 的开发工具箱')
}

unsafeWindow.ll = ll
