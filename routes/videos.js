const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  getVideos,
  getVideo,
  createVideo,
  deleteVideo,
  updateVideo,
  uploadVideoPhoto,
} = require("../controller/videos");

const router = express.Router();

//"/api/v1/videos"
router
  .route("/")
  .get(getVideos)
  .post(protect, authorize("admin", "operator"), createVideo);

router
  .route("/:id")
  .get(protect, getVideo)
  .delete(protect, authorize("admin", "operator"), deleteVideo)
  .put(protect, authorize("admin", "operator"), updateVideo);

router
  .route("/:id/upload-photo")
  .put(protect, authorize("admin", "operator"), uploadVideoPhoto);

module.exports = router;
