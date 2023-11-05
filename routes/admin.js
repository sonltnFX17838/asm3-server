const express = require("express");

const { body } = require("express-validator");

const router = express.Router();

const adminControllers = require("../controllers/admin");
const isAuth = require("../middlewares/is-admin-auth");

const productsControllers = require("../controllers/product");
const orderControllers = require("../controllers/order");

router.post(
  "/change-status-order",
  isAuth.isAdminAuth,
  adminControllers.changeStatusOrder
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
  adminControllers.postSignIn
);

router.post("/log-out", adminControllers.postLogOut);

router.get("/products", isAuth.isAdminAuth, productsControllers.getProducts);

router.get(
  "/search-product/:search",
  isAuth.isAdminAuth,
  productsControllers.getSearch
);

router.get("/history", isAuth.isAdminAuth, adminControllers.getDashboard);

router.delete(
  "/delete/:productId",
  isAuth.isAdminAuth,
  adminControllers.deleteProduct
);

router.get(
  "/product/:productId",
  isAuth.isAdminAuth,
  adminControllers.getProduct
);

router.get(
  "/view-detail/:idDetail",
  isAuth.isAdminAuth,
  orderControllers.getViewDetail
);

router.put(
  "/edit-product/:productId",
  isAuth.isAdminAuth,
  adminControllers.updateProduct
);

router.post("/new-product", isAuth.isAdminAuth, adminControllers.addNewProduct);

module.exports = router;
