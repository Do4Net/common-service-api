'use strict';

/**
 * @desc 处理 Internal Error  返回的状态码为400
 * @type {ErrorCode|exports|module.exports}
 */
const ErrorCode = require( "../libs/ErrorCode");

module.exports = function *internalError(next){

    try {

        yield next;

        if ( this.status == 404 ){
            console.log( "接口 [ "+ this.method + "::" + this.url +" ] 不存在");
            throw new Error;
        }

    } catch(e){

        e.code = e.code || ErrorCode.COMMON_ERROR;
        e.message = e.message || ErrorCode.getErrorMsg(e.code);

        this.halt( e.code , e.message );

        this.app.emit("error", e, this);
    }
};

