exports.clearSessions = async function (options) {
  options = this.parse(options);
  console.log((this.parse(options.security_provider)+'Id'))
  if (!options.user_id) {
    console.error("Please provide user ID in options object.");
    return;
  }
  const keys = await redisClient.keys("sess:*");
  let deletedKeys = 0;
  const deletePromises = keys.map((key) => {
    return redisClient.get(key).then((value) => {
      try {
        value = JSON.parse(value);
        if (value[(this.parse(options.security_provider)+'Id')] === parseInt(options.user_id)) {
          console.log(`Deleting key: ${key}`);
          deletedKeys++;
          return redisClient.del(key);
        }
      } catch (err) {
        console.log(err);
      }
    });
  });

  await Promise.all(deletePromises);
  return deletedKeys;
};
