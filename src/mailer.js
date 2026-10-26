const nodemailer = require('nodemailer');
const { email } = require('./env');

// built once and reused, creating a transport per request is wasteful
const transporter = nodemailer.createTransport({
    service: email.service,
    auth: {
        user: email.user,
        pass: email.pass
    }
});

function sendVerificationCode(to, code) {
    return transporter.sendMail({
        from: email.user,
        to,
        subject: 'Kidverse password reset verification code',
        text: `Your verification code is: ${code}\n\nIt expires in 10 minutes. If you did not request this, you can ignore this email.`
    });
}

module.exports = { sendVerificationCode };
