const User = require("../models/user");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");

exports.postSignUp = async (req, res, next) => {
  const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //   const error = new Error("Validation failed.");
  //   error.statusCode = 422;
  //   error.data = errors.array();
  //   throw error;
  // }
  const { fullName, email, password, phoneNumber } = req.body.user;
  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      fullName: fullName,
      email: email,
      password: hashedPassword,
      phoneNumber: phoneNumber,
    });
    await newUser.save();
    res.status(200).json({ success: true });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postSignIn = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed.");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const email = req.body.email;
  const password = req.body.password;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error("A user with this email could not be found.");
      error.statusCode = 403;
      throw error;
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("Wrong password!");
      error.statusCode = 403;
      throw error;
    }
    req.session.user = user;
    res.status(200).json({ session: req.sessionID, user: user.fullName });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postLogOut = async (req, res, next) => {
  const sessionID = req.headers.authorization;
  try {
    await req.store.destroy(sessionID, (err) => {
      if (err) {
        throw new Error(err);
      }
    });
    res.status(200).json({ success: true });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
