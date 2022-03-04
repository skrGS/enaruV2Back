const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  getComments,
  getComment,
  createComment,
  getVideoComments,
  deleteComment,
  updateComment,
  uploadCommentPhoto,
} = require("../controller/comments");

const router = express.Router();

//"/api/v1/comments"
router
  .route("/")
  .get(getComments)
  .post(protect, authorize("admin", "operator"), createComment);

router
  .route("/:id/videos")
  .get(getVideoComments);

router
  .route("/:id")
  .get(getComment)
  .delete(protect, authorize("admin", "operator"), deleteComment)
  .put(protect, authorize("admin", "operator"), updateComment);

router
  .route("/:id/upload-photo")
  .put(protect, authorize("admin", "operator"), uploadCommentPhoto);

module.exports = router;
