let responseService = require("../../services/metrics/responseMetricService");
let handle = require("../../utils/error_handling");

async function recordResponse(req, res) {
  let data = req.body;
  let response = req.body.response;

  if (response !== undefined) {
    response = response.toString();
  }

  let result = {
    userID: data.userID,
    alarmID: data.alarmID,
    response: req.body.response,
    responseTime: data.responseTime
  }

  try {
    let responseID = await responseService.createResponseLog(data.alarmID, data.userID, response, data.responseTime);
    result.id = responseID;

    res.status(200).json(result);

  } catch (err) {
    console.log(err);
    handle.internalServerError(res, "Cannot create response log");
  } 
}

async function getAllResponseData(req, res) {
  let responses = await responseService.getAllResponseLogs();
  res.status(200).json(responses);
}


module.exports = {
  recordResponse,
  getAllResponseData
}