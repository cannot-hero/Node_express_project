const nodemailer = require('nodemailer')

const sendMail = async options => {
    // 1 create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    })
    // 2 define the email options
    const mailOptions = {
        from: 'Ma shu <hello@foxmail.com>',
        // options.email 说明传入的参数是一个对象
        to: options.email,
        subject: options.subject,
        text: options.message
        // html:
    }
    // 3 actually send the email
    // 👇 async function
    await transporter.sendMail(mailOptions)
}

module.exports = sendMail
