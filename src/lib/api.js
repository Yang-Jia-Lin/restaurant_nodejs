'use strict';

const axios = require('axios');
const crypto = require('crypto');
const BASE_URI = 'https://open.spyun.net/v1/';

function Api(appid, appsecret) {
    this.appid = appid;
    this.appsecret = appsecret;
}

/**
 * 添加打印机
 * @param sn
 * @param pkey
 * @param name
 * @returns AxiosPromise
 */
Api.prototype.addPrinter = function (sn, pkey, name) {
    const params = this.makeRequestParams({
        sn: sn,
        pkey: pkey,
        name: name
    });
    const urlSearchParams = new URLSearchParams();
    Object.keys(params).forEach(function (n) {
        if (params[n] !== null && params[n] !== undefined) {
            urlSearchParams.append(n, params[n]);
        }
    });

    return axios.post(BASE_URI + 'printer/add', urlSearchParams);
};

/**
 * 删除打印机
 * @param sn
 * @returns AxiosPromise
 */
Api.prototype.deletePrinter = function (sn) {
    return axios.delete(BASE_URI + 'printer/delete', {
        params: this.makeRequestParams({
            sn: sn
        })
    });
};

/**
 * 修改打印机信息
 * @param sn
 * @param name
 * @returns AxiosPromise
 */
Api.prototype.updatePrinter = function (sn, name) {
    const params = this.makeRequestParams({
        sn: sn,
        name: name
    });
    const urlSearchParams = new URLSearchParams();
    Object.keys(params).forEach(function (n) {
        if (params[n] !== null && params[n] !== undefined) {
            urlSearchParams.append(n, params[n]);
        }
    });

    return axios.patch(BASE_URI + 'printer/update', urlSearchParams);
};

/**
 * 修改打印机参数
 * @param sn
 * @param auto_cut
 * @param voice
 * @returns AxiosPromise
 */
Api.prototype.updatePrinterSetting = function (sn, auto_cut, voice) {
    const params = this.makeRequestParams({
        sn: sn,
        auto_cut: auto_cut,
        voice: voice
    });
    const urlSearchParams = new URLSearchParams();
    Object.keys(params).forEach(function (n) {
        if (params[n] !== null && params[n] !== undefined && params[n] !== '') {
            urlSearchParams.append(n, params[n]);
        }
    });

    return axios.patch(BASE_URI + 'printer/setting', urlSearchParams);
};

/**
 * 获取打印机信息
 * @param sn
 * @returns AxiosPromise
 */
Api.prototype.getPrinter = function (sn) {
    return axios.get(BASE_URI + 'printer/info', {
        params: this.makeRequestParams({
            sn: sn
        })
    });
};

/**
 * 打印订单
 * @param sn
 * @param content
 * @param times
 * @returns AxiosPromise
 */
Api.prototype.print = function (sn, content, times) {
    const params = this.makeRequestParams({
        sn: sn,
        content: content,
        times: times
    });
    const urlSearchParams = new URLSearchParams();
    Object.keys(params).forEach(function (n) {
        if (params[n] !== null && params[n] !== undefined) {
            urlSearchParams.append(n, params[n]);
        }
    });

    return axios.post(BASE_URI + 'printer/print', urlSearchParams);
};

/**
 * 清空待打印订单
 * @param sn
 * @returns AxiosPromise
 */
Api.prototype.deletePrints = function (sn) {
    return axios.delete(BASE_URI + 'printer/cleansqs', {
        params: this.makeRequestParams({
            sn: sn
        })
    });
};

/**
 * 查询打印订单状态
 * @param id
 * @returns AxiosPromise
 */
Api.prototype.getPrintsStatus = function (id) {
    return axios.get(BASE_URI + 'printer/order/status', {
        params: this.makeRequestParams({
            id: id
        })
    });
};

/**
 * 查询打印机历史打印订单数
 * @param sn
 * @param date
 * @returns AxiosPromise
 */
Api.prototype.getPrintsOrders = function (sn, date) {
    return axios.get(BASE_URI + 'printer/order/number', {
        params: this.makeRequestParams({
            sn: sn,
            date: date
        })
    });
};

/**
 * 创建请求参数
 * @param params
 * @returns {*}
 */
Api.prototype.makeRequestParams = function (params) {
    params.appid = this.appid;
    params.timestamp = Math.floor(new Date().getTime() / 1000);
    params.sign = this.makeSign(params);

    return params;
};

/**
 * 创建签名
 * @param params
 * @returns {string}
 */
Api.prototype.makeSign = function (params) {
    let sign = '';
    Object.keys(params).sort().forEach(function (k, i) {
        if (k != 'sign' && k != 'appsecret' && params[k] !== '' && params[k] !== null && params[k] != undefined) {
            if (i > 0) {
                sign += '&';
            }
            sign += k + '=' + params[k];
        }
    });
    sign += '&appsecret=' + this.appsecret;
    const md5 = crypto.createHash('md5');

    return md5.update(sign).digest('hex').toUpperCase();
};

module.exports = Api;
