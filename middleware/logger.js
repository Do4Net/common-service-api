'use strict';

const log4js = require("log4js");

log4js.configure({
    appenders: [
        { type: "console" },
        { type: "file", filename: "./logs/access.log", category: "http"},
        { type: "file", filename: "./logs/application.log", category: "info"},
        { type: "file", filename: "./logs/application.log.wf", category: "warn"}
    ],
    replaceConsole: true
});

let infoLogger = log4js.getLogger("info");
let warnLogger = log4js.getLogger("warn");

let loggerHandler = {};

// Stack trace format
// https://github.com/v8/v8/wiki/Stack%20Trace%20API
let stackReg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/i;
let stackReg2 = /at\s+()(.*):(\d*):(\d*)/i;;

loggerHandler.trace = function(){
    let args = Array.from( arguments );
    let stack = ( new Error() ).stack.split("\n");
    let sp = stackReg.exec( stack[2] ) || stackReg2.exec( stack[2] );
    args.unshift( "[" + sp[2] + ":" + sp[3] + "] " );
    infoLogger.trace.apply( infoLogger, args );
};
loggerHandler.debug = function(){
    let args = Array.from( arguments );
    let stack = ( new Error() ).stack.split("\n");
    let sp = stackReg.exec( stack[2] ) || stackReg2.exec( stack[2] );
    args.unshift( "[" + sp[2] + ":" + sp[3] + "] " );
    infoLogger.debug.apply( infoLogger, args );
};
loggerHandler.log = loggerHandler.info = function () {
    let args = Array.from( arguments );
    let stack = ( new Error() ).stack.split("\n");
    let sp = stackReg.exec( stack[2] ) || stackReg2.exec( stack[2] );
    args.unshift( "[" + sp[2] + ":" + sp[3] + "] " );
    infoLogger.info.apply( infoLogger, args );
};
loggerHandler.warn = function () {
    let args = Array.from( arguments );
    let stack = ( new Error() ).stack.split("\n");
    let sp = stackReg.exec( stack[2] ) || stackReg2.exec( stack[2] );
    args.unshift( "[" + sp[2] + ":" + sp[3] + "] " );
    infoLogger.warn.apply( infoLogger, args );
};
loggerHandler.error = function () {
    let args = Array.from( arguments );
    let stack = ( new Error() ).stack.split("\n");
    let sp = stackReg.exec( stack[2] ) || stackReg2.exec( stack[2] );
    args.unshift( "[" + sp[2] + ":" + sp[3] + "] " );
    warnLogger.error.apply( warnLogger, args );
};
loggerHandler.fatal = function () {
    let args = Array.from( arguments );
    let stack = ( new Error() ).stack.split("\n");
    let sp = stackReg.exec( stack[2] ) || stackReg2.exec( stack[2] );
    args.unshift( "[" + sp[2] + ":" + sp[3] + "] " );
    warnLogger.fatal.apply( warnLogger, args );
};

//log test
loggerHandler.trace("trace test");
loggerHandler.debug("debug test");
loggerHandler.info("info test");
loggerHandler.warn("warn test");
loggerHandler.error("error test");
loggerHandler.fatal("fatal test");

global.logger = loggerHandler;

var default_format = ':user_id ' +
    ' :remote-addr - -' +
    ' ":method :url:querystring HTTP/:http-version"' +
    ' :status :content-length ":referrer"' +
    ' ":user-agent"' +
    ' :request_body' +
    ' :response_body';

function Logger( options ){

    options = options || {};

    var logger = log4js.getLogger("http");
    var levels = log4js.levels;
    var fmt = options.format || default_format;
    var level = levels.toLevel( options.level, levels.INFO );

    return function *( next ){

        let ctx = this;

        if ( ctx.request.__logging ){ return yield next; }

        var start = new Date();
        var writeHead = ctx.response.writeHead;

        // flag as logging
        ctx.request._logging = true;

        // proxy for statusCode.
        ctx.response.writeHead = function (code, headers) {
            ctx.response.writeHead = writeHead;
            ctx.response.writeHead(code, headers);
            ctx.response.__statusCode = code;
            ctx.response.__headers = headers || {};

            if ( code >= 300 ){
                level = levels.WARN;
            }

            if ( code >= 400 ){
                level = levels.ERROR;
            }
        };

        yield next;

        // hook on end request to emit the log entry of the HTTP request.
        ctx.response.responseTime = new Date() - start;

        // status code response level handling
        if (ctx.res.statusCode && options.level === 'auto') {
            level = levels.INFO;
            if (ctx.res.statusCode >= 300) level = levels.WARN;
            if (ctx.res.statusCode >= 400) level = levels.ERROR;
        }

        var combined_tokens = assemble_tokens(ctx, options.tokens || []);

        logger.log( level, format( fmt, combined_tokens ) );
    };
}

/**
 * Adds custom {token, replacement} objects to defaults, overwriting the defaults if any tokens clash
 *
 * @param  {Koa Context} ctx
 * @param  {Array} custom_tokens [{ token: string-or-regexp, replacement: string-or-replace-function }]
 * @return {Array}
 */
function assemble_tokens (ctx, custom_tokens) {
    var array_unique_tokens = function (array) {
        let a = array.concat()
        for (let i = 0; i < a.length; ++i) {
            for (let j = i + 1; j < a.length; ++j) {
                if (a[i].token == a[j].token) { // not === because token can be regexp object
                    a.splice(j--, 1)
                }
            }
        }
        return a
    }
    var default_tokens = []
    default_tokens.push({ token: ':url', replacement: ctx.originalUrl })
    default_tokens.push({ token: ':querystring', replacement: ctx.querystring});
    default_tokens.push({ token: ':protocol', replacement: ctx.protocol })
    default_tokens.push({ token: ':hostname', replacement: ctx.hostname })
    default_tokens.push({ token: ':method', replacement: ctx.method })
    default_tokens.push({ token: ':status', replacement: ctx.response.status ||
    ctx.response.__statusCode || ctx.res.statusCode })
    default_tokens.push({ token: ':response-time', replacement: ctx.response.responseTime })
    default_tokens.push({ token: ':date', replacement: new Date().toUTCString() })
    default_tokens.push({ token: ':referrer', replacement: ctx.headers.referer || '' })
    default_tokens.push({ token: ':http-version', replacement: ctx.req.httpVersionMajor + '.' + ctx.req.httpVersionMinor })
    default_tokens.push({ token: ':remote-addr', replacement: ctx.headers['X-Forwarded-For'] || ctx.ip || ctx.ips ||
    (ctx.socket && (ctx.socket.remoteAddress || (ctx.socket.socket && ctx.socket.socket.remoteAddress))) })
    default_tokens.push({ token: ':user-agent', replacement: ctx.headers['user-agent'] })
    default_tokens.push({ token: ':content-length', replacement: (ctx.response._headers && ctx.response._headers['content-length']) ||
    (ctx.response.__headers && ctx.response.__headers['Content-Length']) ||
    ctx.response.length || '-' })
    default_tokens.push({ token: /:req\[([^\]]+)\]/g, replacement: function (_, field) {
        return ctx.headers[field.toLowerCase()]
    } })
    default_tokens.push({ token: /:res\[([^\]]+)\]/g, replacement: function (_, field) {
        return ctx.response._headers
            ? (ctx.response._headers[field.toLowerCase()] || ctx.response.__headers[field])
            : (ctx.response.__headers && ctx.response.__headers[field])
    } })
    default_tokens.push({ token: ':request_body', replacement: ctx.request.body ? JSON.stringify( ctx.request.body ) : "-" });
    default_tokens.push({ token: ':response_body', replacement: ctx.response.body ? JSON.stringify( ctx.response.body ) : "-" });
    default_tokens.push({ token: ':user_id', replacement: ctx.user_id || '-'});

    return array_unique_tokens(custom_tokens.concat(default_tokens))
}

/**
 * Return formatted log line.
 *
 * @param  {String} str
 * @param  {IncomingMessage} req
 * @param  {ServerResponse} res
 * @return {String}
 * @api private
 */
function format (str, tokens) {
    for (let i = 0; i < tokens.length; i++) {
        str = str.replace(tokens[i].token, tokens[i].replacement)
    }
    return str
}

module.exports = Logger;
