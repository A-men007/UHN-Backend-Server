require("dotenv").config({ path: __dirname + "/.env" });
const InitializationService = require("./services/initialization.service");
InitializationService.initialize();
const { validateSignup, validateLogin, validateUseRefreshToken, validateDeleteRefreshToken } = require("./utils/error_handling");
const user = require("./controllers/user");
const auth = require("./controllers/auth");
const alarmMetrics = require("./controllers/metrics/alarm");
const responseMetrics = require("./controllers/metrics/response");
const arrivalMetrics = require("./controllers/metrics/arrival");
const treatementMetrics = require("./controllers/metrics/treatment");
const notification = require("./controllers/notification");
const help_request = require("./controllers/help_request")
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan")
let middleware = require("./middleware");
const port = process.env.PORT || 3000;
const app = express()
app.use(express.static(__dirname + "/../public"));
app.use(bodyParser.json());
app.use(logger("dev"))
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get("/", (req, res) => res.send("Server is up"))

app.post("/signup", validateSignup(), auth.signup);
app.post("/login", validateLogin(), auth.login);
app.post("/refresh-token", validateUseRefreshToken(), auth.useRefreshToken);

app.post("/users/:id/responders", middleware.checkToken, user.addResponders);

app.post("/users/:id/notification-token", user.addPushToken);

app.put("/users/:id/location", middleware.checkToken, user.updateLocation);
app.get("/users/:id/location", middleware.checkToken, user.getLocation);

app.post("/users/:id/status", middleware.checkToken, user.toggleOnlineAndNaloxoneAvailabilityStatus);
app.get("/users/:id/online", user.setLastSeen);

app.get("/users/search", middleware.checkToken, user.searchUsers);

app.get("/users/:id", middleware.checkToken, user.userInfo);
app.get("/users/:id/responders", middleware.checkToken, user.getResponders);
app.get("/users/:id/responders/count", middleware.checkToken, user.getResponderCount);
app.get("/users/:id/responding-to", middleware.checkToken, user.respondingTo);
app.delete("/users/:id/responders", middleware.checkToken, user.deleteResponders);
app.get("/users/:id/responders/request", middleware.checkToken, user.requestResponders);


// Help requests
app.post("/help-requests/", middleware.checkToken, help_request.addHelpRequest);
app.get("/help-requests/:id", middleware.checkToken, help_request.getHelpRequest)
app.put("/help-requests/:id", middleware.checkToken, help_request.putHelpRequest);
app.get("/help-requests/:id/responders/count", middleware.checkToken, help_request.getHelpRequestResponderCount)

// NEW
app.get("/users/online", middleware.checkToken,user.OnlineStatus);

// Alarm metrics
app.post("/metrics/alarm", middleware.checkToken, alarmMetrics.alarmStart);
app.put("/metrics/alarm/:alarmID", middleware.checkToken, alarmMetrics.alarmUpdate);

// Response metrics
app.post("/metrics/response", middleware.checkToken, responseMetrics.recordResponse);

// Arrival metrics
app.post("/metrics/arrival", middleware.checkToken, arrivalMetrics.responderArrival);

// Treatement metrics
app.post("/metrics/treatment", middleware.checkToken, treatementMetrics.recordTreatment);

// FOR TESTING ONLY
app.get("/test-notif", notification.testSendNotification);

app.listen(port, function () {
  console.log(`Server is running on port ${port}`);
});

export default app;
