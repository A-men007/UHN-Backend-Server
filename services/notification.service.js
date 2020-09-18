var expo_server = require("../services/expo-server");
var UserService = require("../services/user.service");
var alarmMetricService = require("../services/metrics/alarmMetricService");
import { Expo } from "expo-server-sdk"
const NEED_HELP = "need_help";
const RESPONDER_REQUEST = "responder_request";

var expo = expo_server.getExpoInstance();

// TODO: Need to handle receipts of notifications, to handle errors
// ALSO TODO: Rename this to something related to helprequest so it's not confusing
const sendBatchNotifications = async (user, help_request) => {
  let pushTokens = [];
  let notifications = [];
  let responders = user.responders;

  console.log("SENDING NOTIFS. Reponders:");
  for (let r of responders) {
    let responder = null;

    try {
      responder = await UserService.findUserById(r.id);
      console.log(responder)
      pushTokens.push(responder.pushToken);
    } catch (err) {
      console.error(err.message + "\nSkipping to the next one.");
    }
  }

  let notificationBody = `${user.get("username")} is unresponsive. Please help!`;
  let alarmMetricID = await getAlarmMetricIdHelper(user.get("id"));
  let notificationData = {
    event: NEED_HELP,
    timeStamp: new Date(),
    user: {
      id: user.get("id"),
      username: user.get("username"),
      location: user.get("location")
    },
    alarmMetricId: alarmMetricID,
    helpRequestId: help_request.get("id")
  }

  for (let pt of pushTokens) {
    if (!Expo.isExpoPushToken(pt)) {
      console.error(`Push token ${pt} is not a valid Expo push token`);
      continue;
    } 

    let notification = {
      to: pt,
      sound: "default",
      // TODO: Missing location details
      body: notificationBody,
      // TODO: Pending to change to actual data passed by notification
      data: notificationData
    };

    notifications.push(notification);
  }

  let chunks = expo.chunkPushNotifications(notifications);
  let tickets = [];

  for (let chunk of chunks) {
    try {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      console.log(ticketChunk);
      tickets.push(...ticketChunk);

    } catch (error) {
      console.error(error);
    }
  }
};


const requestResponders = async (user) => {
  console.log("Sending request notifs")
  let pushTokens = [];
  let notifications = [];
  let responders = user.responders;

  for (let r of responders) {
    let responder = null;

    try {
      responder = await UserService.findUserById(r.id);
      pushTokens.push(responder.pushToken);
    } catch (err) {
      console.error(err.message + "\nSkipping to the next one.");
    }
  }

  let notificationBody = `${user.get("username")} is requesting responders, are you available?`;
  let notificationData = {
    event: RESPONDER_REQUEST,
    timeStamp: new Date(),
    user: {
      id: user.get("id"),
      username: user.get("username"),
      location: user.get("location")
    }
  }

  for (let pt of pushTokens) {
    if (!Expo.isExpoPushToken(pt)) {
      console.error(`Push token ${pt} is not a valid Expo push token`);
      continue;
    } 

    let notification = {
      to: pt,
      sound: "default",
      body: notificationBody,
      data: notificationData
    };

    notifications.push(notification);
  }

  let chunks = expo.chunkPushNotifications(notifications);
  let tickets = [];

  for (let chunk of chunks) {
    try {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      console.log(ticketChunk);
      tickets.push(...ticketChunk);

    } catch (error) {
      console.error(error);
    }
  }
};



async function getAlarmMetricIdHelper(userID) {
  let alarmLogs = null;
  let alarmID = null;
  try {
    alarmLogs = await alarmMetricService.getLatestAlarmLogIdForUser(userID);

    if (alarmLogs.length > 0) {
      alarmID = alarmLogs[0].id;
    }

    return alarmID;
  }
  catch (err) {
    console.log(err.message);
    return null;
  }
}


module.exports = {
  sendBatchNotifications,
  requestResponders
};
