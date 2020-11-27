let jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");
const randToken = require("rand-token");

const { customValidationResult } = require("../utils/error_handling");
var handle = require("../utils/error_handling");

var UserModel = require("../models/user").model;

let metricService = require("../services/metrics/userMetricService");
var RefreshTokenService = require("../services/refresh-token.service");
var AvailbilityService = require("../services/availability.service");
var OnlineService = require("../services/online.service");
var UserService = require("../services/user.service");

const TOKEN_DURATION = "15m";

async function login(req, res) {
  const errors = customValidationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  } else {
    var username = req.body.username;
    var password = req.body.password;

    var result = null;

    try {
      result = await UserService.findUserByUsername(username, password);
    } catch (err) {
      return handle.notFound(res, err.message);
    }

    try {
      if (bcrypt.compareSync(password, result.password)) {
        let token = jwt.sign({ id: result._id }, process.env.SECRET, {
          expiresIn: TOKEN_DURATION
        });

        let refreshToken = randToken.uid(128)
        RefreshTokenService.deleteRefreshToken(result._id)
        RefreshTokenService.addRefreshToken(result._id, refreshToken)

        try {
          await OnlineService.setOnline(result._id.toString());
          var onlineStatus = await OnlineService.checkOnlineStatus(result._id.toString());
          if (onlineStatus && result.naloxoneAvailability) {
            AvailbilityService.setAvailable(result._id.toString());
          } else {
            AvailbilityService.setUnavailable(result._id.toString());
          }
        } catch (err) {
          console.log("redis error: ", err.message);
        }

        try {
          await metricService.updateUserLoginTime(username);
        } catch (err) {
          handle.notFound(res, 'Cannot find user in metrics database');
        }

        res.status(200).json({
          success: true,
          message: "Authentication successful!",
          token: token,
          refreshToken: refreshToken,
          id: result._id,
          naloxoneAvailability: result.naloxoneAvailability
        });
      } else {
        handle.unauthorized(res, "Username or password incorrect");
      }
    } catch (err) {
      handle.internalServerError(res, "Bcrypt compareSync failed");
    }
  }
}

async function signup(req, res) {
  const errors = customValidationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  } else {
    var username = req.body.username;
    var email = req.body.email;
    var pass = req.body.password;
    var phone = req.body.phone;
    try {
      let foundUser = await UserModel.findOne({ username: username }).exec();
      if (foundUser) {
        return handle.badRequest(res, "username already exists");
      }
    } catch {
      return handle.internalServerError(res, "cannot query database");
    }

    let newUser = new UserModel({
      username: username,
      email: email,
      password: bcrypt.hashSync(pass, 10),
      phone: phone,
      naloxoneAvailability: false
    });

    try {
      await newUser.save();
    } catch (err) {
      return handle.internalServerError(res, "Cannot create user.");
    }

    OnlineService.setOffline(newUser._id.toString());

    let result = UserService.cleanUserAttributes(newUser.toJSON());

    try {
      await metricService.addNewUserToMetrics(result.id, username);
    } catch (err) {
      console.log(err)
      return handle.internalServerError(res, "Cannot add new user to metrics database")
    }

    res.status(200).json(result);
  }
}

async function useRefreshToken(req, res) {
  const errors = customValidationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  } else {
    let userId = req.body.userId;
    let refreshToken = req.body.refreshToken;
    if (await RefreshTokenService.checkRefreshToken(userId, refreshToken)) {
      let token = jwt.sign({ id: userId }, process.env.SECRET, {
        // expiresIn: TOKEN_DURATION
      });

      // Consider generating new refresh token and returning it so that refresh token will also expire
      res.status(200).json({ token: token });
    } else {
      return handle.unauthorized(res, "Refresh token and user id do not match")
    }
  }
}

module.exports = {
  login,
  signup,
  useRefreshToken,
}