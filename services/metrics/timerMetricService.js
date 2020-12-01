import TimerMetricModel from "../../models/metrics/timer";
import metrics from "../../database/postgres";


let metricDB = metrics.getMetrics();

async function createTimerLog(userID, timeStart, timeEnd, responders) {
  let timerLogId = null;

  let timer = new TimerMetricModel(null, userID.toString(), timeStart, timeEnd, responders);

  try {
    timerLogId = await metricDB("timerLog").insert({
      userid: timer.userid,
      timerStart: timer.timeStart,
      timerEnd: timer.timeEnd,
      responder: timer.responders
    }).returning("id");

    return timerLogId[0];

  } catch (err) {
    throw err;
  }
}

async function getTimerLogById(logID) {
  let timer = await metricDB("timerLog").where({
    id: logID
  }).returning("*");

  if (timer.length === 0) {
    throw new Error("Cannot find timer with given ID");
  } else {
    return timer[0];
  }
}

async function getAndUpdateTimerEndTime(logID, newTime) {
  let newTimerEndTime = null;
  let timer = null;

  try {
    timer = await getTimerLogById(logID);
  } catch (err) {
    throw new Error(err.message);
  }

  try {
    newTimerEndTime = await metricDB("timerLog").where({
      id: timer.id
    }).update({
      timerEnd: newTime
    }).returning("timerEnd");

    return newTimerEndTime;

  } catch (err) {
    throw new Error("Cannot update timer end time");
  }
}

async function getAndUpdateTimerResponders(logID, responders) {
  let newResponders = null;
  let timer = null;

  try {
    timer = await getTimerLogById(logID);
  } catch (err) {
    throw new Error(err.message);
  }

  try {
    newResponders = await metricDB("timerLog").where({
      id: timer.id
    }).update({
      responders: responders
    }).returning("responders");

    return newResponders;

  } catch (err) {
    throw new Error("Cannot update timer responders");
  }
}

async function getLatestTimerLogIdForUser(userID) {
  let latestLog = null;

  try {
    latestLog = await metricDB("timerLog").where({
      userid: userID
    }).orderBy("timerStart", "desc")
    .select("id");
    return latestLog;
  }
  catch (err) {
    console.log(err)
    throw new Error("Cannot get latest timer log for user");
  }
}

async function getAllTimerLogs() {
  let timers = await metricDB("timerLog").returning("*");
  return timers;
}

module.exports = {
  createTimerLog,
  getTimerLogById,
  getAndUpdateTimerEndTime,
  getAndUpdateTimerResponders,
  getLatestTimerLogIdForUser,
  getAllTimerLogs
}