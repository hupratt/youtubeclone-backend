require("dotenv").config();
const fs = require('fs');
const csv = require("fast-csv");


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

const options = {
  objectMode: true,
  delimiter: ",",
  quote: null,
  headers: false,
  renameHeaders: false,
};
const data = [];

async function asyncCallReadCSV() {
  var stream = fs.createReadStream("migration_data.csv");
  await csv
  .parseStream(stream, {headers : false, delimiter: '/n'})
  .on("data", function(data){
      console.log('I am one line of data', data.arg1);
  })
  .on("end", function(){
      console.log("done");
  });
}

asyncCallReadCSV()
// var csvData=[];
// fs.createReadStream(path.join(__dirname,"migration_data.csv"))
//   .pipe(parse({ delimiter: "," }))
//   .on("data", function (row) {
//     console.log(row);
//     csvData.push(row);  
//   })
//   .on("end", function () {
//     console.log("finished");
//   })
//   .on("error", function (error) {
//     console.log(error.message);
//   });

const relPath='uploads/netgear/Videos/1999 part 2/VTS_01_1.m4v'
var fileName = path.basename(relPath);


async function asyncCall() {
  await extractFrames({
    input: path.join('public/frontend/build/static/',relPath),
    output: path.join('public/frontend/build/static/', path.dirname(relPath), `${fileName}-frame-%d.png`),
    numFrames:10
    })

  Video.create({
    userId: process.env.USER_ID,
    title: 'test',
    description: '',
    url: 'uploads/netgear/Videos/1999 part 2/VTS_01_1.m4v',
    thumbnail: path.join('static', path.dirname(relPath),`${fileName}-frame-5.png`),
  }).then(function(item){
    console.log("Created item.")
  }).catch(function (err) {
    console.log(err)
  });
}

asyncCall();




  