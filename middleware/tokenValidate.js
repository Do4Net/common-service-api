'use strict';

const ErrorCode  = require( "../libs/ErrorCode" );
const redis      = require( "../adapter/cache/redis" );
const jwt        = require( "../libs/jwt" );
const authConfig = require( "../config/auth" );
const compare    = require( "secure-compare" );

module.exports = function *tokenValidate( next ) {

    return yield next;

    let error = new Error();

    //path后面加上"/",方便进行正则匹配
    let path = this.path.replace( /(\/$)/i, '' );

    //是否不需要验证token
    let notNeedToken = false;

    for (let router of Object.keys( authConfig.whiteList )) {
        let routerMatched = path.match( new RegExp( '^' + router + '$', "i" ) );
        let methodMatched = authConfig.whiteList[router].find( method => this.method.toLowerCase() == method.toLowerCase() );
        //同时匹配路由和方法时说明不需要token
        notNeedToken      = routerMatched != null && typeof methodMatched != "undefined";
        if (notNeedToken) {
            break;
        }
    }

    logger.info( "Router: [" + this.method + "::" + this.url + "]", "Need Token: ", !notNeedToken );

    let token = this.get( "X-Authorization" ) || this.query["token"] || '';
    let token_info;

    if ( notNeedToken && token == '' ){
        return yield next;
    }

    //尝试解析token
    try {
        token_info = yield jwt.verify( token, authConfig.secret );
    } catch (e) {
        logger.info( "Token ['" + token + "'] 解密错误" );
        error.code = ErrorCode.TOEKN_ERROR;
        throw error;
    }

    logger.log("token info :",  JSON.stringify(token_info) );

    //token是否存在
    let redis_token_key = `token:${token}`;
    let user_info = yield redis.hgetall( redis_token_key );
    let curr_unix_time  = Math.floor( Date.now() / 1000 );

    // TOKEN不存在
    if ( user_info == null ){
        logger.info( `Token ${token} 不存在` );
        if ( notNeedToken ){
            return yield next;
        } else {
            error.code = ErrorCode.TOKEN_INVALID;
            throw error;
        }
    }

    if ( user_info["last_login"] + authConfig.expiration_time < curr_unix_time ){
        if (notNeedToken) {
            return yield next;
        } else {
            error.code = ErrorCode.TOKEN_EXPIRED;
            throw error;
        }
    }

    //更新过期时间
    redis.hset( redis_token_key, "last_login", curr_unix_time );
    redis.expire( redis_token_key, authConfig.expiration_time );

    this.user_id = user_info["user_id"];

    logger.log( "Token 验证通过." );

    yield next;
};
