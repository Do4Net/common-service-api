'use strict';

const feedService = require("../services/feed");

module.exports = function *navSchemeCheck( next ){

    let scheme = this.params["scheme"];

    let feed = new feedService();
    let navs = yield feed.getNavigations();

    //检查scheme是否存在
    if ( navs.find( nav => nav.toJSON().scheme.toLowerCase() == scheme.toLowerCase() ) == undefined ){
        this.status = 404;
        return;
    }

    yield next;
};