const asyncHandler = require("../middleware/async");
const bycryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Auth = require("../models/Auth");
const { createError } = require("../util/createError");
const { encryptPassword } = require("../util/encryptPassword");
const nodemailer = require("nodemailer");
const sgTransport = require("nodemailer-sendgrid-transport");
const crypto = require("crypto");
const options = {
  auth: {
    api_key: process.env.SENDGRID_API_KEY,
  },
};
const mailer = nodemailer.createTransport(sgTransport(options));

//@desc   regester user
//@route  POST /api/v1/auth/register
//@access Public

exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, role, password } = req.body;
  let isUserPresent = await Auth.findOne({ email: email });
  if (isUserPresent) {
    throw createError(
      "user already exist with this email address. plese register with diferent email id",
      409
    );
  }
  const hashedPassword = await encryptPassword(password);
  let user = new Auth({
    name: name,
    email: email,
    role: role,
    password: hashedPassword,
  });
  user = await user.save();

  res.status(200).json({
    success: true,
    message: "user registered successfully",
    data: user,
  });
});

//@desc   login user
//@route  GET /api/v1/auth/login
//@access Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  //check if user exist
  const user = await Auth.findOne({ email: email }).select("+password");

  if (!user) {
    throw createError("no user found with this email", 404);
  }
  if (user) {
    const isSame = await bycryptjs.compare(password, user.password);

    if (isSame) {
      //generate the jwt token
      const data = {
        email: user.email,
        userId: user._id.toString(),
      };
      const secret = process.env.JWT_SECRET_KEY;
      const token = jwt.sign(data, secret, {
        expiresIn: process.env.JWT_TOKEN_EXPIRE,
      });
      const options = {
        expires: new Date(
          Date.now() + process.env.COOKIE_EXPIRE * 60 * 60 * 24 * 7
        ),
        httpOnly: true,
      };

      res.status(200).cookie("token", token, options).json({
        success: true,
        message: "user logged in",
        token: token,
        userId: user._id.toString(),
      });
    } else {
      throw createError("plese enter correct password", 404);
    }
  }
});

//@desc   reset password
//@route  POST /api/v1/auth/resetpassword
//@access prive
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const email = req.body.email;
  const user = await Auth.findOne({ email: email });

  if (!user) {
    throw createError("no user found with this mail", 404);
  }
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/resetpassword/${resetToken}`;
  // console.log(process.env.MAIL_SENDER);
  const mailOptions = {
    to: user.email,
    from: process.env.MAIL_SENDER,
    subject: "Reset Password",
    html: resetUrl,
  };
  mailer.sendMail(mailOptions, async (err, info) => {
    if (err) {
      console.log(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      throw createError(
        "email could not be send at this moment plese try again later",
        500
      );
    } else {
      res.status(200).json({
        success: true,
        message: "password reset successfully",
        data: user,
      });
    }
  });
});

//@desc   change password
//@route  POST /api/v1/auth/resetpassword/:resetId
//@route  POST/api/v1/auth/me/updatepassword
//@access private
exports.changePassword = asyncHandler(async (req, res, next) => {
  let oldPasswordOfUser = req.body.oldpassword;
  let newPasswordOfUser = req.body.newpassword;
  let resetId = req.params.resetId;
  let resetToken;
  let newPassword;
  let user;

  if (resetId) {
    resetToken = crypto.createHash("sha256").update(resetId).digest("hex");
    newPassword = await encryptPassword(req.body.password);
    user = await Auth.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) {
      throw createError(
        "maybe your token has expired plese again reset the password",
        404
      );
    }
  } else {
    user = await Auth.findById(req.user._id.toString()).select("+password");
    console.log(user);
    if (!user) {
      throw createError("no user found", 404);
    }
    let isSame = await bycryptjs.compare(oldPasswordOfUser, user.password);
    if (isSame) {
      newPasswordOfUser = await encryptPassword(newPasswordOfUser);
    } else {
      throw createError("please enter correct old password", 401);
    }
  }

  user.password = newPasswordOfUser || newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  res
    .status(200)
    .json({ success: "true", message: "password changed successful" });
});

//@desc   Log user out
//@route  get /api/v1/auth/logout
//@access private

exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie("token", null, {
    expiresIn: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
});
//@desc   Get all users
//@route  get /api/v1/auth/me
//@access private
exports.getUsers = asyncHandler(async (req, res, next) => {
  const users = await Auth.find();
  if (!users) {
    throw createError("now user found", 404);
  }
  res.status(200).json({ success: true, data: users });
});
//@desc   Update  details of user
//@route  get /api/v1/auth/me/updatedetails
//@access private
exports.updateUserDetails = asyncHandler(async (req, res, next) => {
  const user = await Auth.findById(req.user._id.toString());
  if (!user) {
    throw createError("No user has found to matching this id", 404);
  }
  const updatedUser = await Auth.findByIdAndUpdate(
    req.user._id.toString(),
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!updatedUser) {
    throw createError("could not update the details", 404);
  }
  res.status(200).json({ success: true, data: updatedUser });
});
