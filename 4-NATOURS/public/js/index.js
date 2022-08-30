/* eslint-disable */
// index.js 是入口文件 从用户界面获取数据，委托操作
import '@babel/polyfill'
import { login, logout } from './login'
import { displayMap } from './mapbox'
import { updateData } from './updateSettings'

// 为了避免发ajax请求，可以将数据放在html中，让js进行操作
// DOMELEMENT
const mapBox = document.getElementById('map')
const loginForm = document.querySelector('.form--login')
const logOutBtn = document.querySelector('.nav__el--logout')
const userDataForm = document.querySelector('.form-user-data')
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
        const name = document.getElementById('name').value
        const email = document.getElementById('email').value
        updateData(name, email)
    })
}
