const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "Хэрэглэгчийн нэрийг оруулна уу"],
  },
  lastName: {
    type: String,
    required: [true, "Хэрэглэгчийн овог нэр оруулна уу"],
  },
  humanId: {
    type: String,
    required: [true, "Хэрэглэгчийн регистэр оруулна уу"],
  },
  phone: {
    type: Number,
    required: [true, "Хэрэглэгчийн утасны дугаар оруулна уу"],
  },
  acceptType: {
    default: false,
    type: Boolean,
  },

  email: {
    type: String,
    required: [true, "Хэрэглэгчийн имэйл хаягийг оруулж өгнө үү"],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Имэйл хаяг буруу байна.",
    ],
  },
  fFirstName: {
    type: String,
  },
  fLastName: {
    type: String,
  },
  fHumanId: {
    type: String,
  },
  fRelation: {
    type: String,
  },

  role: {
    type: String,
    required: [true, "Хэрэглэгчийн эрхийг оруулна уу"],
    enum: ["user", "operator", "admin"],
    default: "user",
  },
  accountRole: {
    type: String,
    enum: [
      "Дэмжигч өрх бүл",
      "Дэмжигч гишүүн",
      "Бүтээлч өрх бүл",
      "Бүтээлч гишүүн",
    ],
  },
  password: {
    type: String,
    minlength: 4,
    required: [true, "Нууц үгээ оруулна уу"],
    select: false,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.pre("save", async function (next) {
  // Нууц үг өөрчлөгдөөгүй бол дараачийн middleware рүү шилж
  if (!this.isModified("password")) next();

  // Нууц үг өөрчлөгдсөн
  console.time("salt");
  const salt = await bcrypt.genSalt(10);
  console.timeEnd("salt");

  console.time("hash");
  this.password = await bcrypt.hash(this.password, salt);
  console.timeEnd("hash");
});

UserSchema.methods.getJsonWebToken = function () {
  const token = jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRESIN,
    }
  );

  return token;
};

UserSchema.methods.checkPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.generatePasswordChangeToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model("User", UserSchema);
