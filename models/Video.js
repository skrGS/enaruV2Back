const mongoose = require("mongoose");
const { transliterate, slugify } = require("transliteration");

const VideoSchema = new mongoose.Schema(
  {
    link: {
        type: String
    },
    comment: {
      type: mongoose.Schema.ObjectId,
      ref: "Comment",
    },
    createUser: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    course: {
        type: mongoose.Schema.ObjectId,
        ref: "Course",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    name: {
        type: String,
    }
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

module.exports = mongoose.model("Video", VideoSchema);
