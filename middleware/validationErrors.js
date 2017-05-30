'use strict';

const ErrorCode = require("../libs/ErrorCode");

module.exports = function *ValidationErrors(next){
    yield next;
    if ( this.errors ){
        for( let name of Object.keys(this.errors[0]) ){
            let msg = this.errors[0][name];
            return this.halt( ErrorCode.PARAMS_ERROR, msg );
        }
    }
};

