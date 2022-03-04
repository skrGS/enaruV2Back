const mongoose = require("mongoose");
const { transliterate, slugify } = require("transliteration");

const HistorySchema = new mongoose.Schema(
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
    course: {
        type: mongoose.Schema.ObjectId,
        ref: "Course",
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

module.exports = mongoose.model("History", HistorySchema);
