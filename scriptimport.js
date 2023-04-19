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

const sequelize = new Sequelize(process.env.DATABASE_NM, process.env.DATABASE_USR, process.env.DATABASE_PW, {
  host: process.env.DATABASE_HST,
  dialect: 'postgres',
  logging: false
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
  "2002/Concerto/MOV00284.MPG",
  "2002/Concerto/MOV00285.MPG",
  "2002/Concerto/MOV00286.MPG",
  "2002/Concerto/MOV00287.MPG",
  "2002/Concerto/MOV00288.MPG",
  "2002/Concerto/MOV00289.MPG",
  "2002/Concerto/MOV00291.MPG",
  "2002/Concerto/MOV00299.MPG",
  "2002/Concerto/MOV00303.MPG",
  "2002/Concerto/MOV00304.MPG",
  "2002/Concerto/MOV00305.MPG",
  "2002/Concerto/MOV00306.MPG",
  "2002/Concerto/MOV00307.MPG",
  "2002/2002.mp4",
  "2002/MOV00216.MPG",
  "2002/MOV00234.MPG",
  "2002/MOV00244.MPG",
  "2002/MOV00247.MPG",
  "2002/MOV00250.MPG",
  "2002/MOV00251.MPG",
  "2002/MOV00261.MPG"
]


async function asyncCall(filepath) {
  const relPath = path.join('public/frontend/build/static/uploads/netgear/Videos',filepath)
  const fileName = path.basename(relPath);
  const baseName = path.dirname(filepath)
  // multi thread the creation of thumbnail preview
  console.log('=== input scriptimport.js [73] ===', relPath);
  console.log('=== output scriptimport.js [73] ===', path.join(path.dirname(relPath), `${fileName}-frame-%d.png`));
  await extractFrames({
    input: relPath,
    output: path.join(path.dirname(relPath), `${fileName}-frame-%d.png`),
    numFrames:1
    })

  Video.create({
    userId: process.env.USER_ID,
    title: filepath,
    description: '',
    url: `uploads/netgear/Videos/${filepath}`,
    thumbnail: path.join('static/uploads/netgear/Videos/',baseName,`${fileName}-frame-1.png`),
  }).then(function(item){
    console.log(`${fileName} created`)
  }).catch(function (err) {
    console.log(err)
  });
}


const readPaths=()=>{
  LIST_PATHS.forEach((filepath)=>{
    asyncCall(filepath);

  })
}

readPaths()