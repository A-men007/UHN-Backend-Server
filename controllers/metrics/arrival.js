let arrivalService = require("../../services/metrics/arrivalMetricService");
let handle = require("../../utils/error_handling");

async function responderArrival(req, res) {
  let responseID = req.body.responseID;
  let arrivalTime = req.body.arrivalTime;

  let result = {
    responseID: responseID,
    arrivalTime: arrivalTime
  };

  try {
    let arrivalID = await arrivalService.createArrivalLog(responseID, arrivalTime);
    result.id = arrivalID;
  
    res.status(200).json(result);

  } catch (err) {
    console.log(err);
    handle.internalServerError(res, "Cannot create metrics arrival log")
  }
}

async function getAllArrivalData(req, res) {
  let arrivals = await arrivalService.getAllArrivalData();
  res.status(200).json(arrivals);
}



module.exports = {
  responderArrival,
  getAllArrivalData
}