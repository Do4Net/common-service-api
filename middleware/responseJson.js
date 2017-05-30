'use strict';

const ErrorCode = require("../libs/ErrorCode");

module.exports = function *responseJson(next){
    this.type = "application/json; charset=utf-8";

    this.set( "Content-Type", "application/json" );
    this.set( "Access-Control-Allow-Origin", "*");
    this.set( "Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
    this.set( "Access-Control-Allow-Headers", "X-Requested-With, content-type, X-Authorization");

    this.json = json;
    this.halt = halt;
    yield *next;
};


/**
 *
 * @param data []
 *
 *
 * {
 *     status: 0,
 *     msg: '处理成功',
 *     data: []
 * }
 *
 *
 * 我们约定, 接口请求成功时, 业务code为0,
 * 请求失败时, 业务code 详见:http://phabricator.suiyueyule.com:8088/w/tech/error_code/
 */
function json(data, code, msg){

    var data = data || {};
    var code = code || 0;
    var msg = msg || "";

    var service_msg = msg == "" ? ErrorCode.getErrorMsg(code) : msg;
    var http_code   = ErrorCode.getHttpCode( code );

    _json(this, code, http_code, service_msg, data);
}

/**
 * @desc 返回错误 不带token
 * @param code
 * @param msg
 */
function halt( code, msg){
    var code = code || 50000;
    var msg = msg || "";

    var service_msg = msg == "" ? ErrorCode.getErrorMsg(code) : msg;
    var http_code   = ErrorCode.getHttpCode( code );
    return _json( this, code, http_code, service_msg );
}

/**
 * @desc                响应json信息
 * @param ctx           koa instance
 * @param service_code  业务code
 * @param http_code     http code
 * @param msg           api请求结果
 * @param data          api请求数据
 * @private
 */
function _json(ctx, service_code, http_code, msg, data){
    var data = data || {};

    ctx.status = http_code;

    ctx.body = {
        status: service_code,
        msg: msg,
        data: data
    };
}
