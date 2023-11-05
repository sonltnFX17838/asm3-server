const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const productSchema = new Schema({
  category: { type: String, required: true },
  img1: { type: String, required: true },
  img2: { type: String, required: false },
  img3: { type: String, required: false },
  img4: { type: String, required: false },
  filenames: [{ type: String, required: false }],
  long_desc: { type: String, required: true },
  short_desc: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: String, required: true },
  total: {
    type: Number,
    required: true,
    validate: {
      validator: function (v) {
        return Number.isInteger(v) && v >= 0;
      },
      message: (props) => `${props.value} is not a valid positive integer!`,
    },
  },
});

module.exports = mongoose.model("Product", productSchema);
