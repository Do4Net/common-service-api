'use strict';

const WorksModel = require("../model/works");

module.exports = function *commitCheck( next ){

    let allowTypes = [ WorksModel.TYPE_AUDIO, WorksModel.TYPE_VIDEO ];

    this.checkBody("type").in( allowTypes, "type is not allow" );
    this.checkBody("title").notEmpty().isLength(1,30);
    this.checkBody("words").notEmpty();

    //封面照片
    this.checkBody("cover_photo").notEmpty().notBlank();

    //音乐或者视频
    this.checkBody("file_name").notEmpty().notBlank();
    this.checkBody("file_bucket_id").notEmpty(/^[0-9]+$/, "file_bucket_id is not valid"); //bucket id

    //hash tags
    this.checkBody("hashtags").optional();

    //price
    this.checkBody("price").optional().match(/^[0-9]+$/, "price is not valid").default(0);

    //has demo
    this.checkBody("has_demo").optional().in([0,1],"has demo is not valid").default(0);

    if ( this.errors ){
        return;
    }

    yield next;
};

