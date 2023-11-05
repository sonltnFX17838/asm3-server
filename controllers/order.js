const Order = require("../models/order");
const Product = require("../models/product");
const sendEmailService = require("../utils/emailService");

exports.postAddDetail = async (req, res, next) => {
  const detailId = req.params.detailId;
  const quantity = req.body.quantity;
  try {
    const detail = await Product.findById(detailId);
    const order = await Order.findOne({
      user: req.user._id,
      isCompleted: false,
    });
    if (!order) {
      const newOrder = new Order({
        user: req.user._id,
        cart: {
          items: [{ product: detail._id, quantity: quantity }],
          totalPrice: parseInt(detail.price) * quantity,
        },
      });
      await newOrder.save();
      detail.total -= quantity;
      await detail.save();
      return res.status(200).json({ success: true });
    }

    await order.addDetail(detailId, quantity);
    res.status(200).json({ success: true });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      user: req.user._id,
      isCompleted: false,
    }).populate("cart.items.product");
    res.status(200).json({ order: order });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updateDetail = async (req, res, next) => {
  const productId = req.params.productId;
  const turn = req.body.turn;
  try {
    const order = await Order.findOne({
      user: req.user._id,
      isCompleted: false,
    });
    await order.update(productId, turn);
    res.status(200).json({ success: true });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteDetail = async (req, res, next) => {
  const productId = req.params.productId;
  try {
    const order = await Order.findOne({
      user: req.user._id,
      isCompleted: false,
    });
    await order.delete(productId);
    res.status(200).json({ success: true });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updateCompleteOrder = async (req, res, next) => {
  const orderId = req.params.orderId;
  const { emailOrder, phoneNumberOrder, fullNameOrder, addressOrder } =
    req.body.order;
  const newDay = new Date();
  const orderDay = newDay.toISOString();
  const { email, phoneNumber, fullName } = req.user;
  try {
    if (
      email === emailOrder &&
      phoneNumber === parseInt(phoneNumberOrder) &&
      fullName === fullNameOrder
    ) {
      const compOrder = await Order.findById(orderId)
        .populate({
          path: "user",
          select: "fullName phoneNumber email",
        })
        .populate({
          path: "cart.items.product",
          model: "Product",
        });
      compOrder.isCompleted = true;
      compOrder.orderDay = orderDay;
      compOrder.address = addressOrder;
      await compOrder.save();
      sendEmailService(compOrder);
      return res.status(200).json({ success: true });
    }
    res.status(400).json({ message: "Error with the billing detail" });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getHistory = async (req, res, next) => {
  const userId = req.user._id;
  try {
    const orderHistory = await Order.find({
      user: userId,
    }).populate("user", "fullName phoneNumber");
    res.status(200).json({ orders: orderHistory });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getViewDetail = async (req, res, next) => {
  const idDetail = req.params.idDetail;
  try {
    const detail = await Order.findById(idDetail)
      .populate("cart.items.product")
      .populate("user", "fullName phoneNumber");
    res.status(200).json({ detail: detail });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
