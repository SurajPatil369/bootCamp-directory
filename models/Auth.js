const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const crypto = require("crypto");
const authSchema = new Schema({
  name: {
    type: String,
    required: [true, "plese enter your name"],
  },
  email: {
    type: String,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Plese add the valid email",
    ],
  },
  role: {
    type: String,
    enum: ["user", "publisher", "admin"],
    default: "user",
  },

  password: {
    type: String,
    required: [true, "plese add password"],
    select: false,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

authSchema.methods.getResetPasswordToken = function () {
  //generate token
  const resetToken = crypto.randomBytes(20).toString("hex");
  //hash token and set to reset passwordToken feild
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  //expiry date
  const someDate = new Date();
  const duration = 2; //In Days
  const expireDate = someDate.setTime(
    someDate.getTime() + duration * 24 * 60 * 60 * 1000
  );
  this.resetPasswordExpire = expireDate;
  return resetToken;
};

module.exports = mongoose.model("Auth", authSchema);
