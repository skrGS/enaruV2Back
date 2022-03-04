const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  getHistories,
  getHistory,
  createHistory,
  getVideoHistories,
  deleteHistory,
  updateHistory,
  uploadHistoryPhoto,
} = require("../controller/histories");

const router = express.Router();

//"/api/v1/histories"
router
  .route("/")
  .get(getHistories)
  .post(protect, authorize("admin", "operator"), createHistory);

router
  .route("/:id/videos")
  .get(getVideoHistories);

router
  .route("/:id")
  .get(getHistory)
  .delete(protect, authorize("admin", "operator"), deleteHistory)
  .put(protect, authorize("admin", "operator"), updateHistory);

router
  .route("/:id/upload-photo")
  .put(protect, authorize("admin", "operator"), uploadHistoryPhoto);

module.exports = router;
