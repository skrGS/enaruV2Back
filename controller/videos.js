const Video = require("../models/Video");
const path = require("path");
const Category = require("../models/Category");
const Course = require("../models/Course");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const User = require("../models/User");
const History = require("../models/History");

// api/v1/videos
exports.getVideos = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const sort = req.query.sort;
  const select = req.query.select;

  [("select", "sort", "page", "limit")].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, Video);

  const videos = await Video.find(req.query, select)
    .populate({
      path: "category",
      select: "name averagePrice",
    })
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: videos.length,
    data: videos,
    pagination,
  });
});

exports.getUserVideos = asyncHandler(async (req, res, next) => {
  req.query.createUser = req.userId;
  return this.getVideos(req, res, next);
});

// api/v1/categories/:catId/videos
exports.getCategoryVideos = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 2;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, Video);

  //req.query, select
  const videos = await Video.find(
    { ...req.query, category: req.params.categoryId },
    select
  )
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: videos.length,
    data: videos,
    pagination,
  });
});

exports.getVideo = asyncHandler(async (req, res, next) => {
  const video = await Video.findById(req.params.id);
  const course = await Course.findById(video.course);
  const courseHistory1 = await History.find({course: video.course, createUser: req.userId, video: req.params.id});
  const order = course.videos.indexOf(req.params.id)
  const number = order - 1
  const courseHistory2 = await History.find({course: video.course, createUser: req.userId, video: course.videos[number]});
    
    if (order != 0) {
      if (courseHistory2[0] == undefined) {
        throw new MyError("Өмнөх бичлэгээ үзнэ үү", 404);
      }
      const number = order - 1
      if (String(courseHistory2[0].video) != String(course.videos[number]))
      throw new MyError("Өмнөх бичлэгээ үзнэ үү", 404);
    }
    if (courseHistory1[0] == undefined) {
      req.body.video = req.params.id
      req.body.course = video.course
      req.body.createUser = req.userId
      const history = await History.create(req.body);
    }

  if (!video) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүй байна.", 404);
  }

  res.status(200).json({
    success: true,
    data: video,
  });
});

exports.createCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.create(req.body);

  res.status(200).json({
    success: true,
    data: category,
  });
});

exports.createVideo = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.body.course);
    
  if (!course) {
    throw new MyError(req.body.course + " ID-тэй хичээл байхгүй!", 400);
  }

  req.body.createUser = req.userId;

  const video = await Video.create(req.body);
  course.videos.addToSet(video._id)
  course.save()
  res.status(200).json({
    success: true,
    data: video,
  });
});

exports.deleteVideo = asyncHandler(async (req, res, next) => {
  
  const video = await Video.findById(req.params.id);
  const course = await Course.findById(video.course);

  if (!video) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүй байна.", 404);
  }

  if (video.createUser.toString() !== req.userId && req.userRole !== "admin") {
    throw new MyError("Та зөвхөн өөрийнхөө номыг л засварлах эрхтэй", 403);
  }

  const user = await User.findById(req.userId);
  console.log(course.videos)
  course.videos.pull(video._id)
  course.save()
  video.remove();

  res.status(200).json({
    success: true,
    data: video,
    whoDeleted: user.name,
  });
});

exports.updateVideo = asyncHandler(async (req, res, next) => {
  const video = await Video.findById(req.params.id);

  if (!video) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүйээээ.", 400);
  }

  if (video.createUser.toString() !== req.userId && req.userRole !== "admin") {
    throw new MyError("Та зөвхөн өөрийнхөө номыг л засварлах эрхтэй", 403);
  }

  req.body.updateUser = req.userId;

  for (let attr in req.body) {
    video[attr] = req.body[attr];
  }

  video.save();

  res.status(200).json({
    success: true,
    data: video,
  });
});

// PUT:  api/v1/videos/:id/photo
exports.uploadVideoPhoto = asyncHandler(async (req, res, next) => {
  const video = await Video.findById(req.params.id);

  if (!video) {
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

    video.photo = file.name;
    video.save();

    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
});
