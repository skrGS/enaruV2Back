const mongoose = require("mongoose");
const { transliterate, slugify } = require("transliteration");

const ArticleSchema = new mongoose.Schema(
  {
    createUser: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    body: {
        type: String,
    },
    title: {
        type: String,
    },
    picture: {
        type: String,
    },
    isSpecial: {
        type: Boolean,
        default: false
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

module.exports = mongoose.model("Article", ArticleSchema);
