const config = require('../config/default.json');
const nodemailer = require("nodemailer");

module.exports = {
    sendmail: async function (to_email, name,verifycode) {
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: config.nodemailer.user, // generated ethereal user
                pass: config.nodemailer.password, // generated ethereal password
            },
        });
        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: config.nodemailer.user, // sender address
            to: to_email, // list of receivers
            subject: `${verifycode} là mã khôi phục tài khoản Facebook của bạn`, // Subject line
            html: `
            Xin chào <b>${name}</b>,<br>
            Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu <b>News24H</b> của tài khoản <b>${to_email}</b>.<br>
            Nhập mã đặt lại mật khẩu sau đây:<br><br>
            <span style="padding:10px;background-color:gray;font-size:25px">${verifycode}</span><br><br>
            <span style="color:red">Chú ý: Mã xác thực trên chỉ tồn tại trong 30 phút.</span><br><br>
            Ngoài ra, bạn có thể thay đổi trực tiếp mật khẩu của mình.<br><br>
            <b><a style="background: #4c649b;padding: 10px;color:white;text-decoration:none" href="${config.site.url}/account/recover?code=${verifycode}">Đổi mật khẩu</a></b><br><br>
            `, // html body
        });

    }
}
