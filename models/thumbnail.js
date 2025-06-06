const mongoose = require("mongoose");

const thumbnailSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", require: true },
  videoName: { type: String, required: true },
  version: String,
  image: { type: String, required: true },
  paid: { type: String, default: false },
});

module.exports = mongoose.model("Thumbnail", thumbnailSchema);
