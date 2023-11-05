const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const sessionChatSchema = new Schema({
  connecting: { type: Boolean, required: true },
  sessionContent: [
    {
      role: { type: String, required: true },
      content: { type: String, required: true, default: "Can i help you ?" },
    },
  ],
});

module.exports = mongoose.model("SessionChat", sessionChatSchema);
