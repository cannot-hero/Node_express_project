/* eslint-disable */

export const hideAlert = () => {
    const el = document.querySelector('.alert')
    // 删除dom，需要移到父元素，然后删除子元素
    if (el) el.parentElement.removeChild(el)
}
// type is 'success' or 'error'
export const showAlert = (type, msg) => {
    // 首先隐藏已存在的警报
    hideAlert()
    const markup = `<div class="alert alert--${type}">${msg}</div>`
    // 插入相邻的HTML afterbegin 表示在一开始插入  markup表示想要包含的HTML
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup)
    window.setTimeout(hideAlert, 5000)
}
