const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  getArticles,
  getArticle,
  createArticle,
  getVideoArticles,
  deleteArticle,
  updateArticle,
  uploadArticlePhoto,
} = require("../controller/articles");

const router = express.Router();

//"/api/v1/articles"
router
  .route("/")
  .get(getArticles)
  .post(protect, authorize("admin", "operator"), createArticle);

router
  .route("/:id/videos")
  .get(getVideoArticles);

router
  .route("/:id")
  .get(getArticle)
  .delete(protect, authorize("admin", "operator"), deleteArticle)
  .put(protect, authorize("admin", "operator"), updateArticle);

router
  .route("/:id/upload-photo")
  .post(protect, authorize("admin", "operator"), uploadArticlePhoto);

module.exports = router;
