unsafeWindow._L = {
    test() {
        console.log('这是 LinLin 的开发工具箱')
    },

    queryAll: window.document.querySelectorAll.bind(window.document),

}
