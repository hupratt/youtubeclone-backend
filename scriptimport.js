require("dotenv").config();
const fs = require('fs');
const csv = require("fast-csv");
const { EOL } = require('os');

var path = require("path");
const extractFrames = require('ffmpeg-extract-frames')
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


const LIST_PATHS = [
  "Rihab_Samsung/1678306910136-20220929_125751.mp4",
  "Rihab_Samsung/1678306969253-20220930_081550.mp4"
]


async function asyncCall(relPath) {
  const fileName = path.basename(relPath);
  // multi thread the creation of thumbnail preview
  await extractFrames({
    input: path.join('public/frontend/build/static/',relPath),
    output: path.join('public/frontend/build/static/', path.dirname(relPath), `${fileName}-frame-%d.png`),
    numFrames:10
    })

  Video.create({
    userId: process.env.USER_ID,
    title: relPath.replace('uploads/netgear/Videos/',''),
    description: '',
    url: relPath,
    thumbnail: path.join('static', path.dirname(relPath),`${fileName}-frame-1.png`),
  }).then(function(item){
    console.log(`${fileName} created`)
  }).catch(function (err) {
    console.log(err)
  });
}


const readPaths=()=>{
  LIST_PATHS.forEach((filepath)=>{
    asyncCall(path.join('uploads/netgear/Videos',filepath));

  })
}

readPaths()


  