const mongoose = require("mongoose");
const { transliterate, slugify } = require("transliteration");

const CommentSchema = new mongoose.Schema(
  {
    video: {
      type: mongoose.Schema.ObjectId,
      ref: "Video",
    },
    createUser: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    comment: {
        type: String,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

module.exports = mongoose.model("Comment", CommentSchema);
