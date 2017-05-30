var repository = require('../services'),
    parse = require('co-body');

exports.show = function *show(){
    var user = yield repository.users.getUser(this.params.userId);
    if(!user){
        return this.throw(404, 'No user found');
    } 
    this.body = user;
};

exports.create = function *create(){
    var body = yield parse(this);
    var user = yield repository.users.createUser(body.name);
    this.body = user;
};


//我们可以为我们的某个路由指定多个中间件回调函数，这些中间件会被一次调用。这些路由中间件之间的上下文是共享的
 // router.get('/users/:id', function *(next){
 //    this.user = yield User.findOne({this.params.id});
 //    yield next;
 // }, function *(next){
 //    console.log(this.user);
 //    // => {id:17, name:'Alex'}
 // })


// router.param(param, middleware) => Router

// 为给定的参数运行中间件，对于自动加载和认证十分有用
// router
//    .param('user', function *(next){
//      this.user = users[id];
//      if(!this.user) return this.status = 404;
//      yield next;
//  })
//   .get('/users/:user', function *(next){
//     this.body = this.user;
//   })
//   .get('/users/:user/friends', function *(next){
//     this.body = yield this.user.getFriends();
//  })

//  // /user/3 => {"id": 3, "name": "Alex"}
//  // /users/3/friends => [{"id": 4, "name": "TJ"}]