const { Op } = require("sequelize");
const {
  User,
  Video,
  VideoLike,
  Comment,
  View,
  Subscription,
} = require("../sequelize");
const asyncHandler = require("../middlewares/asyncHandler");

exports.newVideo = asyncHandler(async (req, res, next) => {
  const video = await Video.create({
    ...req.body,
    userId: req.user.id,
  });

  res.status(200).json({ success: true, data: video });
});

exports.getVideo = asyncHandler(async (req, res, next) => {
  const video = await Video.findByPk(req.params.id, {
    include: [
      {
        model: User,
        attributes: ["id", "username", "avatar"],
      },
    ],
  });

  if (!video) {
    return next({
      message: `No video found for ID - ${req.params.id}`,
      statusCode: 404,
    });
  }

  const comments = await video.getComments({
    order: [["createdAt", "DESC"]],
    attributes: ["id", "text", "createdAt"],
    include: [
      {
        model: User,
        attributes: ["id", "username", "avatar"],
      },
    ],
  });
  // console.log('=== comments video.js [48] ===', comments);
  const user = JSON.parse(req.headers.user);
  // console.log('=== user video.js [51] ===', user);
  if (user) {
    const isLiked = await VideoLike.findOne({
      where: {
        [Op.and]: [
          { videoId: req.params.id },
          { userId: user.id },
          { like: 1 },
        ],
      },
    });
    // console.log('=== isLiked video.js [59] ===', isLiked);

    const isDisliked = await VideoLike.findOne({
      where: {
        [Op.and]: [
          { videoId: req?.params.id },
          { userId: user.id },
          { like: -1 },
        ],
      },
    });
    // console.log('=== isDisliked video.js [70] ===', isDisliked);

    const commentsCount = await Comment.count({
      where: {
        videoId: req?.params.id,
      },
    });
    // console.log('=== commentsCount video.js [77] ===', commentsCount);

    const likesCount = await VideoLike.count({
      where: {
        [Op.and]: [{ videoId: req?.params.id }, { like: 1 }],
      },
    });
    // console.log('=== likesCount video.js [84] ===', likesCount);

    const dislikesCount = await VideoLike.count({
      where: {
        [Op.and]: [{ videoId: req?.params.id }, { like: -1 }],
      },
    });
    // console.log('=== dislikesCount video.js [91] ===', dislikesCount);

    const views = await View.count({
      where: {
        videoId: req?.params.id,
      },
    });
    // console.log('=== views video.js [98] ===', views);

    const isSubscribed = await Subscription.findOne({
      where: {
        subscriber: user.id,
        subscribeTo: video.userId,
      },
    });

    const isViewed = await View.findOne({
      where: {
        userId: user.id,
        videoId: video.id,
      },
    });

    const subscribersCount = await Subscription.count({
      where: { subscribeTo: video.userId },
    });

    // likesCount, disLikesCount, views
    video.setDataValue("comments", comments);
    video.setDataValue("commentsCount", commentsCount);
    video.setDataValue("isLiked", !!isLiked);
    video.setDataValue("isDisliked", !!isDisliked);
    video.setDataValue("likesCount", likesCount);
    video.setDataValue("dislikesCount", dislikesCount);
    video.setDataValue("views", views);
    video.setDataValue("isSubscribed", !!isSubscribed);
    video.setDataValue("isViewed", !!isViewed);
    video.setDataValue("subscribersCount", subscribersCount);
  }
  res.status(200).json({ success: true, data: video });
});

exports.likeVideo = asyncHandler(async (req, res, next) => {
  const video = await Video.findByPk(req.params.id);

  if (!video) {
    return next({
      message: `No video found for ID - ${req.params.id}`,
      statusCode: 404,
    });
  }

  const liked = await VideoLike.findOne({
    where: {
      userId: req.user.id,
      videoId: req.params.id,
      like: 1,
    },
  });

  const disliked = await VideoLike.findOne({
    where: {
      userId: req.user.id,
      videoId: req.params.id,
      like: -1,
    },
  });

  if (liked) {
    await liked.destroy();
  } else if (disliked) {
    disliked.like = 1;
    await disliked.save();
  } else {
    await VideoLike.create({
      userId: req.user.id,
      videoId: req.params.id,
      like: 1,
    });
  }

  res.json({ success: true, data: {} });
});

exports.dislikeVideo = asyncHandler(async (req, res, next) => {
  const video = await Video.findByPk(req.params.id);

  if (!video) {
    return next({
      message: `No video found for ID - ${req.params.id}`,
      statusCode: 404,
    });
  }

  const liked = await VideoLike.findOne({
    where: {
      userId: req.user.id,
      videoId: req.params.id,
      like: 1,
    },
  });

  const disliked = await VideoLike.findOne({
    where: {
      userId: req.user.id,
      videoId: req.params.id,
      like: -1,
    },
  });

  if (disliked) {
    await disliked.destroy();
  } else if (liked) {
    liked.like = -1;
    await liked.save();
  } else {
    await VideoLike.create({
      userId: req.user.id,
      videoId: req.params.id,
      like: -1,
    });
  }

  res.json({ success: true, data: {} });
});

exports.addComment = asyncHandler(async (req, res, next) => {
  const video = await Video.findByPk(req.params.id);

  if (!video) {
    return next({
      message: `No video found for ID - ${req.params.id}`,
      statusCode: 404,
    });
  }

  const comment = await Comment.create({
    text: req.body.text,
    userId: req.user.id,
    videoId: req.params.id,
  });

  const User = {
    id: req.user.id,
    avatar: req.user.avatar,
    username: req.user.username,
  };

  comment.setDataValue("User", User);

  res.status(200).json({ success: true, data: comment });
});

exports.newView = asyncHandler(async (req, res, next) => {
  const video = await Video.findByPk(req.params.id);
  if (!video) {
    return next({
      message: `No video found for ID - ${req.params.id}`,
      statusCode: 404,
    });
  }
  // console.log('=== req.user.id video.js [253] ===', req.headers.userid);
  const viewed = await View.findOne({
    where: {
      userId: req.headers.userid,
      videoId: req.params.id,
    },
  });
  
  if (viewed) {
    return next({ message: "You already viewed this video", statusCode: 200 });
  }
  await View.create({
    userId: req.headers.userid,
    videoId: req.params.id,
  });
  

  res.status(200).json({ success: true, data: {} });
});

exports.searchVideo = asyncHandler(async (req, res, next) => {
  if (!req.query.searchterm) {
    return next({ message: "Please enter the searchterm", statusCode: 400 });
  }

  const videos = await Video.findAll({
    include: { model: User, attributes: ["id", "avatar", "username"] },
    where: {
      [Op.or]: {
        title: {
          [Op.substring]: req.query.searchterm,
        },
        description: {
          [Op.substring]: req.query.searchterm,
        },
      },
    },
  });

  if (!videos.length)
    return res.status(200).json({ success: true, data: videos });

  videos.forEach(async (video, index) => {
    const views = await View.count({ where: { videoId: video.id } });
    video.setDataValue("views", views);

    if (index === videos.length - 1) {
      return res.status(200).json({ success: true, data: videos });
    }
  });
});
