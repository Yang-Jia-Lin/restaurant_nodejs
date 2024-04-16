require('dotenv').config();
const nodemailer = require('nodemailer');

class EmailAlertService {
    constructor() {
        // 设置邮件服务和认证方式
        this.transporter = nodemailer.createTransport({
            host: "smtp.qq.com",
            port: 465,
            secure: true, // 使用 SSL
            auth: {
                user: "2239969828@qq.com",
                pass: "nwezbnkvlefzeajc"
            }
        });
    }

    async sendEmail(subject, message, recipients) {
        try {
            let info = await this.transporter.sendMail({
                from: `"Error Alert System" <2239969828@qq.com>`,
                to: recipients,         // 收件人列表，逗号分隔
                subject: subject,       // 主题
                text: message,          // 纯文本内容
                html: `<b>${message}</b>` // HTML 内容
            });

            console.log(`Email sent: ${info.messageId}`);
        } catch (error) {
            console.error(`Failed to send email: ${error}`);
        }
    }
}

module.exports = new EmailAlertService();
