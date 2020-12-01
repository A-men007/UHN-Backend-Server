import ResponseMetricModel from "../../models/metrics/response";
import metrics from "../../database/postgres";

let metricDB = metrics.getMetrics();

async function createResponseLog(alarmID, userID, response, time) {
  let newResponseID = null;
  let responseModel = new ResponseMetricModel(null, userID, alarmID, response, time);

  try {
    newResponseID = await metricDB("responselog").insert({
      responderid: responseModel.responderID,
      alarmid: responseModel.alarmID,
      alertresponse: responseModel.alertResponse,
      responsetime: responseModel.responseTime
    }).returning("id");

    return newResponseID[0];

  } catch (err) {
    throw new Error(err.message);
  } 
}



async function getAllResponseLogs() {
  let responses = await metricDB("responselog").returning("*");
  return responses;
}

module.exports = {
  createResponseLog,
  getAllResponseLogs
}