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
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

module.exports = mongoose.model("Comment", CommentSchema);
