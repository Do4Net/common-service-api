'use strict';

const redisConfig = require( "../../config/redis" );
const redis       = require( "redis" );
const bluebird    = require( "bluebird" );

const host        = redisConfig.host;
const port        = redisConfig.port;
const options     = redisConfig.options;
const redisClient = redis.createClient( port, host, options );

if (typeof redisConfig.auth == "string") {
    redisClient.auth( redisConfig.auth, ( err, result ) => console.log( "redis: ", err, result ) );
}

redisClient.on( "error", error => console.log( "Redis Error", error ) );

redisClient.exists        = bluebird.promisify( redisClient.exists );
redisClient.hset          = bluebird.promisify( redisClient.hset );
redisClient.hgetall       = bluebird.promisify( redisClient.hgetall );
redisClient.lrange        = bluebird.promisify( redisClient.lrange );
redisClient.llen          = bluebird.promisify( redisClient.llen );
redisClient.lrem          = bluebird.promisify( redisClient.lrem );
redisClient.linsert       = bluebird.promisify( redisClient.linsert );
redisClient.get           = bluebird.promisify( redisClient.get );
redisClient.zadd          = bluebird.promisify( redisClient.zadd );
redisClient.zrange        = bluebird.promisify( redisClient.zrange );
redisClient.zcount        = bluebird.promisify( redisClient.zcount );
redisClient.zrevrange     = bluebird.promisify( redisClient.zrevrange );
redisClient.zrangebyscore = bluebird.promisify( redisClient.zrangebyscore );
redisClient.rpop          = bluebird.promisify( redisClient.rpop );
redisClient.rpoplpush     = bluebird.promisify( redisClient.rpoplpush );
redisClient.lpush         = bluebird.promisify( redisClient.lpush );
redisClient.rpush         = bluebird.promisify( redisClient.rpush );
redisClient.sadd          = bluebird.promisify( redisClient.sadd );
redisClient.srem          = bluebird.promisify( redisClient.srem );
redisClient.sismember     = bluebird.promisify( redisClient.sismember );
redisClient.smembers      = bluebird.promisify( redisClient.smembers );


module.exports = redisClient;
