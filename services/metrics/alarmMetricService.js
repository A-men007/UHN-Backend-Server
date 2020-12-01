import AlarmMetricModel from "../../models/metrics/alarm";
import metrics from "../../database/postgres";

let metricDB = metrics.getMetrics();

async function createAlarmLog(userID, timeStart, timeEnd) {
  let alarmLogID = null;

  let alarm = new AlarmMetricModel(null, userID.toString(), timeStart, timeEnd, false);

  try {
    alarmLogID = await metricDB("alarmlog").insert({
      userid: alarm.userid,
      alarmstart: alarm.timeStart,
      alarmend: alarm.timeEnd,
      alarmsent: alarm.wasSent
    }).returning("id");

    return alarmLogID[0];

  } catch (err) {
    throw err;
  }
}

async function getAlarmLogById(logID) {
  let alarm = await metricDB("alarmlog").where({
    id: logID
  }).returning("*");

  if (alarm.length === 0) {
    throw new Error("Cannot find alarm with given ID");
  } else {
    return alarm[0];
  }
}

async function getAllAlarmLogs() {
  let alarms = await metricDB("alarmlog").returning("*");
  return alarms;
}

async function getAndUpdateAlarmEndTime(logID, newTime) {
  let newAlarmEndTime = null;
  let alarm = null;

  try {
    alarm = await getAlarmLogById(logID);
  } catch (err) {
    throw new Error(err.message);
  }

  try {
    newAlarmEndTime = await metricDB("alarmlog").where({
      id: alarm.id
    }).update({
      alarmend: newTime
    }).returning("alarmend");

    return newAlarmEndTime;

  } catch (err) {
    throw new Error("Cannot update alarm end time");
  }
}

async function getAndUpdateAlarmSent(logID, status) {
  let newAlarmSent = null;
  let alarm = null;

  try {
    alarm = await getAlarmLogById(logID);
  } catch (err) {
    throw new Error(err.message);
  }

  try {
    newAlarmSent = await metricDB("alarmlog").where({
      id: alarm.id
    }).update({
      alarmsent: status
    }).returning("alarmsent");

    return newAlarmSent;

  } catch (err) {
    throw new Error("Cannot update alarm sent status");
  }
}

async function getLatestAlarmLogIdForUser(userID) {
  let latestLog = null;

  try {
    latestLog = await metricDB("alarmlog").where({
      userid: userID,
      alarmsent: "true"
    }).orderBy("alarmstart", "desc")
    .select("id");
    return latestLog;
  }
  catch (err) {
    console.log(err)
    throw new Error("Cannot get latest alarm log for user");
  }
}

module.exports = {
  createAlarmLog,
  getAlarmLogById,
  getAndUpdateAlarmEndTime,
  getAndUpdateAlarmSent,
  getLatestAlarmLogIdForUser,
  getAllAlarmLogs
}