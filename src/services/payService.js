require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const axios = require('axios');

class PayService {
    constructor() {
        this.ac = this.getThirdKeys();
        this.certContent = this.loadCertificate(); // 加载并保存证书内容
    }

    //============================内部方法==========================
    // 获取基础信息
    getThirdKeys() {
        return {
            pem: process.env.PEM_FILE_NAME,
            mchid: process.env.MCHID,
            appid: process.env.APP_ID,
            serial_no: process.env.SERIAL_NO,
            key: process.env.KEY
        };
    }
    // 加载证书内容
    loadCertificate() {
        const pemPath = `./cert/${this.ac.pem}`;
        try {
            return fs.readFileSync(pemPath, "utf-8");
        } catch (err) {
            console.error('证书文件读取失败:', err);
            return null;
        }
    }
    // 生成随机字符串方法（防重放）
    generateNonceStr(len) {
        let data = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";
        let str = "";
        for (let i = 0; i < len; i++) {
            str += data.charAt(Math.floor(Math.random() * data.length));
        }
        return str;
    }
    // 解密回调参数方法
    async decodePayNotify(resource) {
        try {
            const AUTH_KEY_LENGTH = 16;
            const { ciphertext, associated_data, nonce } = resource;
            const key_bytes = Buffer.from(this.ac.key, 'utf8');
            const nonce_bytes = Buffer.from(nonce, 'utf8');
            const associated_data_bytes = Buffer.from(associated_data, 'utf8');
            const ciphertext_bytes = Buffer.from(ciphertext, 'base64');
            const cipherdata_length = ciphertext_bytes.length - AUTH_KEY_LENGTH;
            const cipherdata_bytes = ciphertext_bytes.slice(0, cipherdata_length);
            const auth_tag_bytes = ciphertext_bytes.slice(cipherdata_length, ciphertext_bytes.length);
            const decipher = crypto.createDecipheriv(
                'aes-256-gcm', key_bytes, nonce_bytes
            );
            decipher.setAuthTag(auth_tag_bytes);
            decipher.setAAD(Buffer.from(associated_data_bytes));
            const output = Buffer.concat([
                decipher.update(cipherdata_bytes),
                decipher.final(),
            ]);
            // 转换成 JSON 格式
            return JSON.parse(output.toString('utf8'));
        }
        catch (error) {
            console.error('解密错误:', error);
            return null;
        }
    }



    //===========================外部调用方法========================

    // 预支付交易会话标识prepay_id
    async getPrepayInfo(order, notifyUrl) {
        console.log(`开始获取预支付信息，订单ID：${order.order_id}`);
        try {
            const timestamp = Math.floor(new Date().getTime() / 1000);
            const nonce_str = this.generateNonceStr(32);
            const method = "POST";
            const url = "/v3/pay/transactions/jsapi";

            const wxOrderInfo = {
                mchid: this.ac.mchid,
                appid: this.ac.appid,
                notify_url: notifyUrl,
                out_trade_no: order.order_id,
                description: order.description,
                amount: {
                    total: order.total_price,
                    currency: "CNY"
                },
                payer: {
                    openid: order.openid
                }
            };

            // 构建签名字符串
            const signStr = `${method}\n${url}\n${timestamp}\n${nonce_str}\n${JSON.stringify(wxOrderInfo)}\n`;
            const sign = crypto.createSign("RSA-SHA256");
            sign.update(signStr);
            const signature = sign.sign(this.certContent, "base64");

            const Authorization = `WECHATPAY2-SHA256-RSA2048 mchid="${this.ac.mchid}",nonce_str="${nonce_str}",timestamp="${timestamp}",signature="${signature}",serial_no="${this.ac.serial_no}"`;

            // 发送请求获取prepay_id
            const response = await axios.post("https://api.mch.weixin.qq.com/v3/pay/transactions/jsapi", wxOrderInfo, {
                headers: { Authorization: Authorization },
            });

            console.log(`预支付信息获取成功，订单ID：${order.order_id}`);
            return response;
        } catch (error) {
            console.error(`获取预支付信息失败，订单ID：${order.order_id}`, error);
            throw error;
        }
    }


    // 创建客户端签名（发送给客户端）
    async createPaySign(prepay_id) {
        let timeStamp = (Math.floor(new Date().getTime() / 1000)).toString();
        let nonceStr = this.generateNonceStr(32);
        let signStr = `${this.ac.appid}\n${timeStamp}\n${nonceStr}\nprepay_id=${prepay_id}\n`;
        let sign = crypto.createSign("RSA-SHA256");
        sign.update(signStr);
        return {
            paySign: sign.sign(this.certContent, "base64"),
            timestamp: timeStamp,
            nonce_str: nonceStr,
            signType: 'RSA',
            package: 'prepay_id=' + prepay_id
        };
    }

    
    // 支付回调验证
    async verifyPaymentSuccess(req) {
        try {
            const deInfo = await this.decodePayNotify(req.body.resource);
            if (!deInfo || deInfo.trade_state !== 'SUCCESS') {
                throw new Error('支付回调参数错误');
            }
            return { success: true, deInfo };
        } catch (err) {
            console.error('支付回调验证失败', err);
            return { success: false, message: '支付回调验证失败', status: 500 };
        }
    }

}

module.exports = PayService;