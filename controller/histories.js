const History = require("../models/History");
const path = require("path");
const Video = require("../models/Video");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const User = require("../models/User");

// api/v1/histories
exports.getHistories = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const sort = req.query.sort;
  const select = req.query.select;

  [("select", "sort", "page", "limit")].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, History);

  const histories = await History.find(req.query, select)
    .populate({
      path: "category",
      select: "name averagePrice",
    })
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: histories.length,
    data: histories,
    pagination,
  });
});

exports.getUserHistories = asyncHandler(async (req, res, next) => {
  req.query.createUser = req.userId;
  return this.getHistories(req, res, next);
});

// api/v1/categories/:catId/histories
exports.getVideoHistories = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 2;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, History);

  //req.query, select
  const histories = await History.find(
    { ...req.query, category: req.params.categoryId },
    select
  )
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: histories.length,
    data: histories,
    pagination,
  });
});

exports.getHistory = asyncHandler(async (req, res, next) => {
  const history = await History.findById(req.params.id);

  if (!history) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүй байна.", 404);
  }

  res.status(200).json({
    success: true,
    data: history,
  });
});

exports.createCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.create(req.body);

  res.status(200).json({
    success: true,
    data: category,
  });
});

exports.createHistory = asyncHandler(async (req, res, next) => {
//   const category = await Category.findById(req.body.category);

//   if (!category) {
//     throw new MyError(req.body.category + " ID-тэй категори байхгүй!", 400);
//   }

  req.body.createUser = req.userId;

  const history = await History.create(req.body);

  res.status(200).json({
    success: true,
    data: history,
  });
});

exports.deleteHistory = asyncHandler(async (req, res, next) => {
  const history = await History.findById(req.params.id);

  if (!history) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүй байна.", 404);
  }

  if (history.createUser.toString() !== req.userId && req.userRole !== "admin") {
    throw new MyError("Та зөвхөн өөрийнхөө номыг л засварлах эрхтэй", 403);
  }

  const user = await User.findById(req.userId);

  history.remove();

  res.status(200).json({
    success: true,
    data: history,
    whoDeleted: user.name,
  });
});

exports.updateHistory = asyncHandler(async (req, res, next) => {
  const history = await History.findById(req.params.id);

  if (!history) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүйээээ.", 400);
  }

  if (history.createUser.toString() !== req.userId && req.userRole !== "admin") {
    throw new MyError("Та зөвхөн өөрийнхөө номыг л засварлах эрхтэй", 403);
  }

  req.body.updateUser = req.userId;

  for (let attr in req.body) {
    history[attr] = req.body[attr];
  }

  history.save();

  res.status(200).json({
    success: true,
    data: history,
  });
});

// PUT:  api/v1/histories/:id/photo
exports.uploadHistoryPhoto = asyncHandler(async (req, res, next) => {
  const history = await History.findById(req.params.id);

  if (!history) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүйээ.", 400);
  }

  // image upload

  const file = req.files.file;

  if (!file.mimetype.startsWith("image")) {
    throw new MyError("Та зураг upload хийнэ үү.", 400);
  }

  if (file.size > process.env.MAX_UPLOAD_FILE_SIZE) {
    throw new MyError("Таны зурагны хэмжээ хэтэрсэн байна.", 400);
  }

  file.name = `photo_${req.params.id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, (err) => {
    if (err) {
      throw new MyError(
        "Файлыг хуулах явцад алдаа гарлаа. Алдаа : " + err.message,
        400
      );
    }

    history.photo = file.name;
    history.save();

    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
});
