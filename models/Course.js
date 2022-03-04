const mongoose = require("mongoose");
const { transliterate, slugify } = require("transliteration");

const CourseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Хичээлын нэрийг оруулна уу"],
      unique: true,
      trim: true,
      maxlength: [250, "Хичээлын нэрний урт дээд тал нь 250 тэмдэгт байх ёстой."],
    },
    photo: {
      type: String,
      default: "no-photo.jpg",
    },
    teacher: {
      type: String,
      trim: true,
      maxlength: [
        50,
        "Зохиогчийн нэрний урт дээд тал нь 50 тэмдэгт байх ёстой.",
      ],
    },
    price: {
      type: Number,
      min: [500, "Хичээлын үнэ хамгийн багадаа 500 төгрөг байх ёстой"],
    },
    content: {
      type: String,
      trim: true,
      maxlength: [5000, "Хичээлын нэрний урт дээд тал нь 20 тэмдэгт байх ёстой."],
    },
    bestseller: {
      type: Boolean,
      default: false,
    },
    videos: [{
      type: mongoose.Schema.ObjectId,
      ref: "Videos",
    }],

    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
    },

    createUser: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },

    updateUser: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

CourseSchema.statics.computeCategoryAveragePrice = async function (catId) {
  const obj = await this.aggregate([
    { $match: { category: catId } },
    { $group: { _id: "$category", avgPrice: { $avg: "$price" } } },
  ]);

  console.log(obj);
  let avgPrice = null;

  if (obj.length > 0) avgPrice = obj[0].avgPrice;

  await this.model("Category").findByIdAndUpdate(catId, {
    averagePrice: avgPrice,
  });

  return obj;
};

CourseSchema.post("save", function () {
  this.constructor.computeCategoryAveragePrice(this.category);
});

CourseSchema.post("remove", function () {
  this.constructor.computeCategoryAveragePrice(this.category);
});

CourseSchema.virtual("zohiogch").get(function () {
  // this.author
  if (!this.author) return "";

  let tokens = this.author.split(" ");
  if (tokens.length === 1) tokens = this.author.split(".");
  if (tokens.length === 2) return tokens[1];

  return tokens[0];
});

module.exports = mongoose.model("Course", CourseSchema);
