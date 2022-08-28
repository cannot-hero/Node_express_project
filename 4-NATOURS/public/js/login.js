/* eslint-disable */

const login = async (email, password) => {
    // alert({ email, password }) 注意先确认函数可以work
    console.log({ email, password })
    try {
        const res = await axios({
            method: 'post',
            url: 'http://127.0.0.1:3000/api/v1/users/login',
            data: {
                email,
                password
            }
        })
        console.log(res)
    } catch (err) {
        console.log(err.response.data)
    }
}

document.querySelector('.form').addEventListener('submit', e => {
    e.preventDefault()
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    login(email, password)
})
