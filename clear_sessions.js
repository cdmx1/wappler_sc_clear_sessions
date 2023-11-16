
const Redis = require('ioredis');

exports.clearSessions = async function (options) {
  options = this.parse(options);
  let redis;

  if (process.env.REDIS_HOST) {
    redis = new Redis({
      port: process.env.REDIS_PORT || 6379,
      host: process.env.REDIS_HOST,
      db: options.redis_db || 0,
      password: process.env.REDIS_PASSWORD || undefined,
      username: process.env.REDIS_USER || undefined,
      tls: process.env.REDIS_TLS || undefined,
    });
  } else {
    redis = global.redisClient;
  }
  try {
    if (!redis) {
      console.error('Redis client not initialized.');
      return 0;
    }
    if (!options.user_id) {
      console.error("Please provide User ID");
      return 0;
    }
    const keys = await redis.keys("sess:*");
    let deletedKeys = 0;
    const deletePromises = keys.map((key) => {
      return redis.get(key).then((value) => {
        try {
          value = JSON.parse(value);
          if (value[(this.parse(options.security_provider) + 'Id')] === parseInt(options.user_id)) {
            console.log(`Deleting key: ${key}`);
            deletedKeys++;
            return redis.del(key);
          }
        } catch (err) {
          console.log(err);
        }
      });
    });

    await Promise.all(deletePromises);
    return deletedKeys;
  } catch (error) {
    console.error('Error occurred:', error);
    return 0;
  }
};