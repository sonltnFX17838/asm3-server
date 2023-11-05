const Product = require("../models/product");

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    res.status(200).json({ products: products });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getSearch = async (req, res, next) => {
  const searchKey = req.params.search;
  try {
    const products = await Product.find();
    const newProducts = products.filter((prod) =>
      prod.name.toLowerCase().includes(searchKey.toLowerCase())
    );
    res.status(200).json({ products: newProducts });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getDetail = async (req, res, next) => {
  const detailId = req.params.detailId;
  try {
    const itemDetail = await Product.findById(detailId);
    const relatedDetail = await Product.find({
      _id: { $ne: itemDetail._id },
      category: itemDetail.category,
    });
    res
      .status(200)
      .json({ itemDetail: itemDetail, relatedDetail: relatedDetail });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
