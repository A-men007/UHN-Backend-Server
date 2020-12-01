let timerService = require("../../services/metrics/timerMetricService");
let handle = require("../../utils/error_handling");

async function timerStart(req, res) {
  let data = req.body;

  let result = {
    userID: data.userID,
    startTime: data.startTime,
    endTime: data.endTime,
    responders: data.responders
  };
  try {
    let timerId = await timerService.createTimerLog(data.userID, data.startTime, data.endTime, data.responders);
    console.log(timerId);
    result.timerId = timerId;

    res.status(200).json(result);

  } catch (err) {
    console.log(err)
    handle.internalServerError(res, "Cannot create metrics timer log for user");
  }
}

async function timerUpdate(req, res) {
  let newEndTime = req.body.newEndTime;
  let id = req.params.timerId;

  let result = {
    timerId: id
  };

  let updatedTime = null;

  try {
    if (newEndTime) {
      updatedTime = await timerService.getAndUpdateTimerEndTime(id, newEndTime);
    }

    if (updatedTime !== null) {
      result.timerEnd = updatedTime[0];
    }
    
    res.status(200).json(result);

  } catch (err) {
    console.log(err.message)
    handle.internalServerError(res, "Cannot update metrics timer log properties");
  }  
}

async function getAllTimerData(req, res) {
  let timers = await timerService.getAllTimerLogs();
  res.status(200).json(timers);
}


module.exports = {
  timerStart,
  timerUpdate,
  getAllTimerData
}