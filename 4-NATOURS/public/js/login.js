/* eslint-disable */
import axios from 'axios'
import { showAlert } from './alerts'

export const login = async (email, password) => {
    // alert({ email, password }) 注意先确认函数可以work
    try {
        const res = await axios({
            method: 'post',
            url: 'http://127.0.0.1:3000/api/v1/users/login',
            data: {
                email,
                password
            }
        })
        if (res.data.status === 'success') {
            showAlert('success', 'Login successfully!')
            window.setTimeout(() => {
                location.assign('/')
            }, 1500)
        }
    } catch (err) {
        showAlert('error', err.response.data.message)
    }
}
