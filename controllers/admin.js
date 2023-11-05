const User = require("../models/user");
const bcrypt = require("bcrypt");
const Product = require("../models/product");
const Order = require("../models/order");
const { validationResult } = require("express-validator");
// const { unlink } = require("fs/promises");
const cloudinary = require("cloudinary").v2;

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
    const user = await User.findOne({
      email: email,
      role: { $in: ["Admin", "Counselors"] },
    });
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
    return res
      .status(200)
      .json({ session: req.sessionID, user: user.fullName, role: user.role });
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
        throw err;
      }
    });
    return res.status(200).json({ success: true });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  const productId = req.params.productId;

  try {
    const order = await Order.findOne({ "cart.items.product": productId });
    if (order) {
      const error = new Error("Product has in another cart");
      error.statusCode = 403;
      throw error;
    } else {
      const product = await Product.findById(productId);
      if (product.filenames.length > 0) {
        product.filenames.forEach((filename) => {
          cloudinary.uploader.destroy(filename);
        });
      }
      if (product) {
        await Product.findByIdAndDelete(productId);
        return res.status(200).json({ success: true });
      } else {
        throw new Error("Something wrong ...");
      }
    }
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getProduct = async (req, res, next) => {
  const productId = req.params.productId;
  try {
    const product = await Product.findById(productId);
    return res.status(200).json({ product: product });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  const { category, name, long_desc, short_desc, price, total } =
    req.body.product;
  const productId = req.params.productId;
  try {
    const updateProduct = await Product.findById(productId);
    updateProduct.name = name;
    updateProduct.category = category;
    updateProduct.long_desc = long_desc;
    updateProduct.short_desc = short_desc;
    updateProduct.price = price;
    updateProduct.total = total;

    await updateProduct.save();
    return res.status(200).json({ success: true });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.addNewProduct = async (req, res, next) => {
  const { name, price, category, long_desc, short_desc, total } = req.body;
  const images = req.files;
  try {
    const filenames = [];
    images.forEach((file) => {
      filenames.push(file.filename);
    });
    if (images.length === 4) {
      const newProduct = new Product({
        name: name,
        price: price,
        category: category,
        long_desc: long_desc,
        short_desc: short_desc,
        total: total,
        img1: images[0].path,
        img2: images[1].path,
        img3: images[2].path,
        img4: images[3].path,
        filenames: filenames,
      });
      await newProduct.save();
      return res.status(200).json({ product: newProduct });
    } else if (!images) {
      const error = new Error("No image provided or image illegal");
      error.statusCode = 400;
      throw error;
    } else {
      req.files.forEach((file) => {
        cloudinary.uploader.destroy(file.filename);
      });
    }
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getDashboard = async (req, res, next) => {
  try {
    const orderHistory = await Order.find().populate(
      "user",
      "fullName phoneNumber"
    );
    const currentDate = new Date();
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const newOrder = await Order.count({
      isCompleted: true,
      transactionStatus: false,
    });
    const ordersOfMonth = await Order.find({
      isCompleted: true,
      orderDay: {
        $gte: firstDayOfMonth.toISOString(),
        $lte: currentDate.toISOString(),
      },
    });
    let earningOfMonth = 0;
    for (const order of ordersOfMonth) {
      earningOfMonth += order.cart.totalPrice;
    }
    const users = await User.count({ role: "Client" });
    const dashboard = {
      earningOfMonth: earningOfMonth,
      history: orderHistory,
      newOrder: newOrder,
      users: users,
    };
    res.status(200).json({ dashboard });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.changeStatusOrder = async (req, res, next) => {
  const { idOrder, status } = req.body;
  const order = await Order.findById(idOrder).populate(
    "user",
    "fullName phoneNumber"
  );
  order.transactionStatus = status;
  await order.save();
  res.status(200).json({ order });
};
