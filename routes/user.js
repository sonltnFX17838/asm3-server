const express = require("express");

const { body } = require("express-validator");

const router = express.Router();

const User = require("../models/user");
const userControllers = require("../controllers/user");

router.post(
  "/sign-up",
  [
    body("user.email")
      .notEmpty()
      .isEmail()
      .withMessage("Email must be valid!")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("E-Mail address already exists!");
          }
        });
      })
      .normalizeEmail(),
    body("user.fullName")
      .notEmpty()
      .isLength({ min: 5, max: 20 })
      .withMessage("Name must be 5 to 20 characters!"),
    body("user.password")
      .notEmpty()
      .isLength({ min: 6 })
      .withMessage("Password must be longer than 5 characters"),
    body("user.phoneNumber")
      .notEmpty()
      .isLength({ min: 8, max: 10 })
      .isNumeric()
      .withMessage("Phone must be a number and 8 to 10 number"),
  ],
  userControllers.postSignUp
);

router.post(
  "/sign-in",
  [
    body("email").notEmpty().isEmail().withMessage("Email must be valid!"),
    body("password")
      .notEmpty()
      .isLength({ min: 6 })
      .withMessage("Password must be longer than 5 characters"),
  ],
  userControllers.postSignIn
);

router.post("/log-out", userControllers.postLogOut);

module.exports = router;
