const express = require("express");
const { body } = require("express-validator");

const router = express.Router();

const isAuth = require("../middlewares/is-auth");
const orderControllers = require("../controllers/order");

router.post(
  "/add-detail/:detailId",
  isAuth.isAuth,
  orderControllers.postAddDetail
);

router.post(
  "/update-order/:orderId",
  [
    body("order.emailOrder")
      .isEmpty()
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
    body("order.fullNameOrder")
      .isEmpty()
      .isLength({ min: 5, max: 20 })
      .withMessage("Name must be 5 to 20 characters!"),
    body("order.phoneNumberOrder")
      .isEmpty()
      .isLength({ min: 8, max: 10 })
      .isNumeric()
      .withMessage("Phone must be a number and 8 to 10 number"),
    body("order.addressOrder")
      .isEmpty()
      .isLength({ min: 8 })
      .isNumeric()
      .withMessage("Address must be valid!"),
  ],
  isAuth.isAuth,
  orderControllers.updateCompleteOrder
);

router.post(
  "/update-detail/:productId",
  isAuth.isAuth,
  orderControllers.updateDetail
);

router.get("/get-order", isAuth.isAuth, orderControllers.getOrder);

router.delete(
  "/delete-detail/:productId",
  isAuth.isAuth,
  orderControllers.deleteDetail
);

router.get("/get-history", isAuth.isAuth, orderControllers.getHistory);

router.get(
  "/view-detail/:idDetail",
  isAuth.isAuth,
  orderControllers.getViewDetail
);

module.exports = router;
