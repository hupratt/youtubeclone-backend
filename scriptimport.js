require("dotenv").config();

const pg = require("pg");
const { Sequelize, DataTypes } = require("sequelize");
const UserModel = require("./src/models/User");
const VideoModel = require("./src/models/Video");
const VideoLikeModel = require("./src/models/VideoLike");
const CommentModel = require("./src/models/Comment");
const SubscriptionModel = require("./src/models/Subscription");
const ViewModel = require("./src/models/View");
const uuid = require('uuid');

pg.defaults.ssl = true;
const sequelize = new Sequelize(process.env.DATABASE_NM, process.env.DATABASE_USR, process.env.DATABASE_PW, {
  host: process.env.DATABASE_HST,
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  }
});
(async () => await sequelize.sync({ alter: true }))();

const User = UserModel(sequelize, DataTypes);
const Video = VideoModel(sequelize, DataTypes);
const VideoLike = VideoLikeModel(sequelize, DataTypes);
const Comment = CommentModel(sequelize, DataTypes);
const Subscription = SubscriptionModel(sequelize, DataTypes);
const View = ViewModel(sequelize, DataTypes);

// video - user association
Video.belongsTo(User, { foreignKey: "userId" });

// likes association
User.belongsToMany(Video, { through: VideoLike, foreignKey: "userId" });
Video.belongsToMany(User, { through: VideoLike, foreignKey: "videoId" });

// comments association
User.hasMany(Comment, {
  foreignKey: "userId",
});
Comment.belongsTo(User, { foreignKey: "userId" });

Video.hasMany(Comment, {
  foreignKey: "videoId",
});

// subscription association
User.hasMany(Subscription, {
  foreignKey: "subscribeTo",
});

// views association
User.belongsToMany(Video, { through: View, foreignKey: "userId" });
Video.belongsToMany(User, { through: View, foreignKey: "videoId" });

module.exports = {
  User,
  Video,
  VideoLike,
  Comment,
  Subscription,
  View,
};


try {

    const video = Video.create({
        userId: process.env.USER_ID,
    title: 'test',
    description: '',
    url: 'req.file.path',
    thumbnail: `test_1.png`,
    createdAt: null,
    updatedAt: null,
});
} catch (e) {
    console.log(e)
}