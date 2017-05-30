'use strict';

const config = require("../config/qiniu");

module.exports = function *resourceInit( next ){

    this.checkQuery("type").notEmpty().isNumeric().in( Object.keys( config["upload_policy"] ) , "type is not allow");

    if ( this.errors ){
        return;
    }

    let type = this.query["type"];
    let putPolicy = config["upload_policy"][ type ];

    this.qiniu = {
        "access_key": config.access_key,
        "secret_key": config.secret_key,
        "put_policy": putPolicy
    };

    yield next;
};



