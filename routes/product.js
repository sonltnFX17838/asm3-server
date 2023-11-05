const express = require("express");

const router = express.Router();

const productControllers = require("../controllers/product");

router.get("/products", productControllers.getProducts);

router.get("/detail/:detailId", productControllers.getDetail);

router.get("/search-product/:search", productControllers.getSearch);

module.exports = router;
