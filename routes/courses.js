const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  getCourses,
  getCourse,
  createCourse,
  deleteCourse,
  updateCourse,
  uploadCoursePhoto,
} = require("../controller/courses");

const router = express.Router();

//"/api/v1/courses"
router
  .route("/")
  .get(getCourses)
  .post(protect, authorize("admin", "operator"), createCourse);

router
  .route("/:id")
  .get(getCourse)
  .delete(protect, authorize("admin", "operator"), deleteCourse)
  .put(protect, authorize("admin", "operator"), updateCourse);

router
  .route("/:id/upload-photo")
  .put(protect, authorize("admin", "operator"), uploadCoursePhoto);

module.exports = router;
