var redis = require("./redis");
const onlineService = require("./online.service");
const availableUsers = "available_users";
var UserModel = require("../models/user").model;
var ObjectId = require("mongodb").ObjectId;

const DISTANCE_THRESHOLD = 0.5;
const TIME_THRESHOLD = 300000; //MS

async function setAvailable(userId) {
  try {
    const res = await redis.saddAsync(availableUsers, userId);
  } catch (err) {
    console.log("redis setAvailable error: ", err.message);
  }
}

async function setUnavailable(userId) {
  try {
    const res = await redis.sremAsync(availableUsers, userId);
  } catch (err) {
    console.log("redis setUnavailable error: ", err.message);
  }
}


async function checkAvailabilityStatus(userId) {

  try {
    const res = await redis.sismemberAsync(availableUsers, userId);
    return res ? true : false;
  }
  catch (err) {
    console.log("redis checkAvailabilityStatus error: ", err.message);
    return false;
  }
}


async function checkAvailabilityStatusWithDistance(userId, userLat, userLng) {

  var responder = await UserModel.findOne({
    _id: new ObjectId(userId)
  }).lean();

  let responderCoords = responder.location.coords;

  let distance = findDistance(responderCoords.lat, responderCoords.lng, userLat, userLng, "K")

  try {
    const res = await redis.sismemberAsync(availableUsers, userId);
    const recentlyOnline = parseInt(await onlineService.getLastSeen(userId));
    const now = (new Date()).valueOf();
    const recentlySeen = (recentlyOnline.valueOf() + TIME_THRESHOLD > now);
    return (res && (distance < DISTANCE_THRESHOLD) && recentlySeen) ? true : false;
  } catch (err) {
    console.log("redis checkAvailabilityStatus error: ", err.message);
    return false;
  }
}

function findDistance(lat1, lon1, lat2, lon2, unit) {
  if ((lat1 == lat2) && (lon1 == lon2)) {
    return 0;
  }
  else {
    var radlat1 = Math.PI * lat1 / 180;
    var radlat2 = Math.PI * lat2 / 180;
    var theta = lon1 - lon2;
    var radtheta = Math.PI * theta / 180;
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = dist * 180 / Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit == "K") { dist = dist * 1.609344 }
    if (unit == "N") { dist = dist * 0.8684 }
    return dist;
  }
}

module.exports = {
  setAvailable,
  setUnavailable,
  checkAvailabilityStatus,
  checkAvailabilityStatusWithDistance,
}
