"use strict";
const Router = require( "koa-router" );
const router = new Router();

const webApi = require( "../webapi" );
 
//user 
router.get('/users/:userId', webApi.Users.show );  
router.post('/users', webApi.Users.create);

module.exports = router.middleware();

