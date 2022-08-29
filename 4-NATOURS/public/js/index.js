/* eslint-disable */
// index.js 是入口文件 从用户界面获取数据，委托操作
import '@babel/polyfill'
import { login, logout } from './login'
import { displayMap } from './mapbox'

// 为了避免发ajax请求，可以将数据放在html中，让js进行操作
// DOMELEMENT
const mapBox = document.getElementById('map')
const loginForm = document.querySelector('.form')
const logOutBtn = document.querySelector('.nav__el--logout')
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
