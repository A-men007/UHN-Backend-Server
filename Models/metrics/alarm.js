export default class timeMetricModel {
  constructor(id, userID, timeStart, timeEnd, wasSent) {
    this.id = id;
    this.userid = userID;
    this.timeStart = timeStart;
    this.timeEnd = timeEnd;
    this.wasSent = wasSent;
  }
}
