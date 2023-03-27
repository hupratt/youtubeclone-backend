const express = require("express");
const router = express.Router();
const { recommendedVideos } = require("../controllers/user");
const { protect } = require("../middlewares/auth");

const {
  newVideo,
  getVideo,
  likeVideo,
  dislikeVideo,
  addComment,
  newView,
  searchVideo,
} = require("../controllers/video");
const videoUploadController = require('../controllers/video-upload-controller');

router.route('/upload').post(protect, videoUploadController.uploadFile);
router.route("/").post(protect, newVideo);
router.route("/").get(recommendedVideos);
router.route("/search").get(protect, searchVideo);
router.route("/:id").get(getVideo);
router.route("/:id/like").get(protect, likeVideo);
router.route("/:id/dislike").get(protect, dislikeVideo);
router.route("/:id/comment").post(protect, addComment);
router.route("/:id/view").get(newView);

module.exports = router;
