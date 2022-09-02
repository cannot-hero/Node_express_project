/* eslint-disable */
// index.js 是入口文件 从用户界面获取数据，委托操作
import '@babel/polyfill'
import { login, logout } from './login'
import { displayMap } from './mapbox'
import { updateSettings } from './updateSettings'

// 为了避免发ajax请求，可以将数据放在html中，让js进行操作
// DOMELEMENT
const mapBox = document.getElementById('map')
const loginForm = document.querySelector('.form--login')
const logOutBtn = document.querySelector('.nav__el--logout')
const userDataForm = document.querySelector('.form-user-data')
const userPasswordForm = document.querySelector('.form-user-password')

// 委派 delegation
if (mapBox) {
    const locations = JSON.parse(mapBox.dataset.locations)
    displayMap(locations)
}

if (loginForm) {
    loginForm.addEventListener('submit', e => {
        e.preventDefault()
        const email = document.getElementById('email').value
        const password = document.getElementById('password').value
        login(email, password)
    })
}

// logout
if (logOutBtn) logOutBtn.addEventListener('click', logout)

// update user data
if (userDataForm) {
    userDataForm.addEventListener('submit', e => {
        // preventDefault 阻止表单提交
        e.preventDefault()
        // create a new form, to appending new data 重建了表单
        const form = new FormData()
        form.append('name', document.getElementById('name').value)
        form.append('email', document.getElementById('email').value)
        form.append('photo', document.getElementById('photo').files[0])
        // console.log(form)
        updateSettings(form, 'data')
    })
}
if (userPasswordForm) {
    userPasswordForm.addEventListener('submit', async e => {
        // preventDefault 阻止表单提交
        e.preventDefault()
        document.querySelector('.btn--save-password').textContent =
            'Updating...'
        const passwordCurrent = document.getElementById('password-current')
            .value
        const password = document.getElementById('password').value
        const passwordConfirm = document.getElementById('password-confirm')
            .value
        // 要在更新密码之后清除页面中相应字段， await等待这个完成
        await updateSettings(
            { passwordCurrent, password, passwordConfirm },
            'password'
        )
        document.querySelector('.btn--save-password').textContent =
            'Save password'
        document.getElementById('password-current').value = ''
        document.getElementById('password').value = ''
        document.getElementById('password-confirm').value = ''
    })
}
