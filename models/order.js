const mongoose = require("mongoose");
const Product = require("./product");

const Schema = mongoose.Schema;

const orderSchema = new Schema({
  user: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  cart: {
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
    totalPrice: { type: Number, required: true },
  },
  isCompleted: { type: Boolean, default: false },
  orderDay: { type: String, required: false },
  transactionStatus: { type: Boolean, default: false },
  address: { type: String, required: true, default: "Waiting check-out" },
});

orderSchema.pre("save", async function (next) {
  const order = this;
  let totalPrice = 0;
  for (const item of order.cart.items) {
    const product = await Product.findById(item.product);
    if (product) {
      totalPrice = totalPrice + parseInt(product.price) * item.quantity;
    }
  }
  order.cart.totalPrice = totalPrice;
  next();
});

orderSchema.methods.addDetail = async function (productId, quantity) {
  const order = this;
  const existingItem = order.cart.items.find(
    (item) => item.product.toString() === productId.toString()
  );
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    order.cart.items.push({ product: productId, quantity: quantity });
  }
  const product = await Product.findById(productId);
  if (product.total < quantity) {
    throw new Error("total is not enought");
  }
  product.total -= quantity;
  await product.save();
  await order.save();
};

orderSchema.methods.update = async function (productId, turn) {
  const order = this;
  const existingIndex = order.cart.items.findIndex(
    (item) => item.product.toString() === productId.toString()
  );
  if (existingIndex >= 0) {
    const product = await Product.findById(productId);
    if (turn === "up") {
      if (product.total === 0) {
        throw new Error("total is not enought");
      }
      order.cart.items[existingIndex].quantity++;
      product.total--;
      await product.save();
    } else {
      order.cart.items[existingIndex].quantity--;
      product.total++;
      await product.save();
    }
  }
  await order.save();
};

orderSchema.methods.delete = async function (productId) {
  const order = this;
  const existingIndex = order.cart.items.findIndex(
    (item) => item.product.toString() === productId.toString()
  );

  if (existingIndex >= 0) {
    const product = await Product.findById(productId);
    product.total += order.cart.items[existingIndex].quantity;
    await product.save();
    order.cart.items.splice(existingIndex, 1);
  }
  await order.save();
};

module.exports = mongoose.model("Order", orderSchema);
