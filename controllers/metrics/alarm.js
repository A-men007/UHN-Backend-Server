let alarmService = require("../../services/metrics/alarmMetricService");
let handle = require("../../utils/error_handling");

async function alarmStart(req, res) {
  let data = req.body;

  let result = {
    userID: data.userID,
    startTime: data.startTime,
    endTime: data.endTime
  };

  try {
    let alarmID = await alarmService.createAlarmLog(data.userID, data.startTime, data.endTime);
    console.log(alarmID);
    result.alarmID = alarmID;

    res.status(200).json(result);

  } catch (err) {
    console.log(err)
    handle.internalServerError(res, "Cannot create metrics alarm log for user");
  }
}

async function alarmUpdate(req, res) {
  let sentStatus = req.body.sentStatus;
  let newEndTime = req.body.newEndTime;
  let id = req.params.alarmID;

  let result = {
    alarmID: id
  };

  if (sentStatus !== undefined) {
    sentStatus = sentStatus.toString()
  }

  let updatedStatus = null;
  let updatedTime = null;

  try {
    if (sentStatus) {
      updatedStatus = await alarmService.getAndUpdateAlarmSent(id, sentStatus);
    }
    if (newEndTime) {
      updatedTime = await alarmService.getAndUpdateAlarmEndTime(id, newEndTime);
    }

    if (updatedStatus !== null) {
      result.alarmStatus = updatedStatus[0];
    }
    if (updatedTime !== null) {
      result.alarmEnd = updatedTime[0];
    }
    
    res.status(200).json(result);

  } catch (err) {
    console.log(err.message)
    handle.internalServerError(res, "Cannot update metrics alarm log properties");
  }
  
}

async function getAllAlarmData(req, res) {
  let alarms = await alarmService.getAllAlarmLogs();
  res.status(200).json(alarms);
}

module.exports = {
  alarmStart,
  alarmUpdate,
  getAllAlarmData
}