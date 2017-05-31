const app = require('koa')(),
 responseTime = require('koa-response-time'),
 logger = require('koa-logger'),
 compress = require('koa-compress'),
 mount = require('koa-mount'),
 favicon = require('koa-favicon'),
 cors = require('koa-cors'),
 co = require('co'),
 path = require('path'),
 db = require('./data'),
 routers = require('./routers/webapiroute');
 // const session = require("koa-session");
 // const bodyParser = require("koa-bodyparser");
 // const compress = require("koa-compress");
 // global.Promise = require("bluebird");

 
 // session
//app.keys = ["common-wspi"];
//app.use(session(app));
//validate
//require("koa-validate")(app);

app.use(compress());
app.use(cors()); 
app.use(logger());
//app.use(favicon());
app.use(compress());
app.use(responseTime()); 
app.use(mount('/v1', routers));

// load middleware
// app.use( require("./middleware/logger")({"level": "auto"}));
// app.use( require("./middleware/responseTime") ); //接口响应时间
// app.use( require("./middleware/internalError")); //错误处理
// app.use( require("./middleware/responseJson"));  //提供json和halt接口
// app.use( require("./middleware/tokenValidate")); //token验证
// app.use( require("./middleware/validationErrors")); //字段校验

//引入sentry收集日志
app.on("error", function (err, ctx) {
    console.error( err );
    //sentry.captureException(err);
   // logger.error( "Error name: " , err.name );
   // logger.error( "Error code: " , err.code );
   // logger.error( "Error message: ", err.message );
});

co(function *(){
    var connection = db.sequelize.client;
    if(connection){
        app.listen(8099);
        console.log('connected to database and listening on port 8099');
    }
})();
 
