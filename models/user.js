var mongoose = require("../database/mongoose");
var mongoose = mongoose.getmongoose();
var Schema = mongoose.Schema;

const model = mongoose.model("users", new Schema({
  username: String,
  password: String,
  phone: String,
  location: {
    coords: {
      lat: Number,
      lng: Number
    },
    note: String,
  },
  responders: [{ _id: false, id: String }],
  pushToken: String,
  lastSeen: Date,
  naloxoneAvailability: Boolean
}, { versionKey: false }));

module.exports = {
  model
}
