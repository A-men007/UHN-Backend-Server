var redis = require("./redis");
const onlineUsers = "online_users"
const lastSeen = "last_seen";

async function setOnline(userId) {
  try {
    await redis.saddAsync(onlineUsers, userId.toString());
  } catch(err) {
    console.error("redis setOnline error: ", err.message);
  }
}

async function setOffline(userId) {
  try {
    await redis.sremAsync(onlineUsers, userId.toString());
  } catch(err) {
    console.error("redis setOffline error: ", err.message);
  }
}

async function checkOnlineStatus(userId) {
  try {
    const res = await redis.sismemberAsync(onlineUsers, userId.toString());
    return res ? true : false;
  } catch(err) {
    console.error("redis checkOnlineStatus error: ", err.message);
    return false;
  }
}

async function setLastSeen(userId, lastSeen) {
  try {
    await redis.hsetAsync(lastSeen, userId.toString(), lastSeen.valueOf());
  } catch(err) {
    console.error("redis setOffline error: ", err.message);
  }
}

async function getLastSeen(userId) {
  try {
    return await redis.hgetAsync(lastSeen, userId.toString());
  } catch(err) {
    return console.error("redis checkOnlineStatus error: ", err.message);
  }
}

module.exports = {
  setOnline,
  setOffline,
  checkOnlineStatus,
  setLastSeen,
  getLastSeen
}
