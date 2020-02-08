let model = require("../Models/user").userMetrics;

let metricDB = require("knex")({
  client: "pg",
  connection: process.env.DATABASE_URL
});

async function updateUserLoginTime(username){
  let checkExists = null;
  try {
    await metricDB("users").where({
      username: username
    }).update({
      lastlogin: metricDB.fn.now()
    }).returning("*").then(res => {
      checkExists = res;
      console.log(checkExists);
    });

    if (checkExists.length < 1) {
      try {
        await addNewUserToMetrics(username);
      } catch (err) {
        throw err;
      }
    }
  } catch (err) {
    throw err;
  }
}

async function addNewUserToMetrics(username) {
  try {
    await metricDB("users").insert({
     username: username,
     lastlogin: metricDB.fn.now()
   }).returning("*").then(res => {
     console.log(res);
   })
  } catch (err) {
    throw err;
  }
}

module.exports = {
  updateUserLoginTime,
  addNewUserToMetrics
}