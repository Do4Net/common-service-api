'use strict';

const config = require("../config/qiniu");

module.exports = function *resourceInit( next ){

    this.checkQuery("type").notEmpty().isNumeric().in( Object.keys( config["download_policy"] ) , "type is not allow");
    this.checkQuery("file").notEmpty();

    if ( this.errors ){
        return;
    }

    let type = this.query["type"];
    let getPolicy = config["download_policy"][ type ];

    this.qiniu = {
        "access_key": config.access_key,
        "secret_key": config.secret_key,
        "get_policy": getPolicy
    };

    yield next;
};



