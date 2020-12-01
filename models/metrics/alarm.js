export default class AlarmMetricModel {
  constructor(id, userID, timeStart, timeEnd, wasSent, timerid) {
    this.id = id;
    this.userid = userID;
    this.timeStart = timeStart;
    this.timeEnd = timeEnd;
    this.wasSent = wasSent;
    this.timerid = timerid;
  }
}
