export default class TimerMetricModel {
  constructor(id, userID, timeStart, timeEnd, responders) {
    this.id = id;
    this.userid = userID;
    this.timeStart = timeStart;
    this.timeEnd = timeEnd;
    this.responders = responders;
  }
}
