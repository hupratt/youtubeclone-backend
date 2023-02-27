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
  '1963-1984/VTS_01_0.m4v',
'1963-1984/VTS_01_1.m4v',
'1963-1984/VTS_01_2.m4v',
'1963-1984/VTS_01_3.m4v',
'1999 part 1/VTS_01_3.m4v',
'1999 part 1/VTS_01_2.m4v',
'1999 part 1/VTS_01_1.m4v',
'1999 part 1/VTS_01_4.m4v',
'1999 part 2/VTS_01_5.m4v',
'1999 part 2/VTS_01_4.m4v',
'1999 part 2/VTS_01_3.m4v',
'1999 part 2/VTS_01_2.m4v',
'1999 part 2/VTS_01_1.m4v',
'1999 part 2/VTS_01_1 (copy).m4v',
'2000/VTS_01_2.m4v',
'2000/VTS_01_1.m4v',
'2000/VTS_01_3.m4v',
'2000/VTS_01_4.m4v',
'2000/VTS_01_5.m4v',
'2003/VTS_01_1.m4v',
'abril 2003/VTS_01_3.m4v',
'abril 2003/VTS_01_4.m4v',
'abril 2003/VTS_01_1.m4v',
'abril 2003/VTS_01_5.m4v',
'abril 2003/VTS_01_2.m4v',
'avril 2004/VTS_01_3.m4v',
'avril 2004/VTS_01_1.m4v',
'avril 2004/VTS_01_0.m4v',
'avril 2004/VTS_01_2.m4v',
'avril 2008/VTS_01_1.m4v',
'avril 2008/VTS_01_2.m4v',
'concert 2006/VTS_01_3.m4v',
'concert 2006/dance.mp4',
'concert 2006/VTS_01_4.m4v',
'concert 2006/sara.mp4',
'concert 2006/VTS_01_2.m4v',
'concert 2006/VTS_01_1.m4v',
'dec 2007/VTS_01_3.m4v',
'dec 2007/VTS_01_1.m4v',
'dec 2007/VTS_01_2.m4v',
'jan 2005/Brand Witlock 56_NEW.m4v',
'mai 2004/VTS_01_2.m4v',
'mai 2004/VTS_01_1.m4v',
'mai 2004/VTS_01_4.m4v',
'mai 2004/VTS_01_3.m4v',
'mai 2004/VTS_01_5.m4v',
'natal 2003 part 2/VTS_01_2.m4v',
'natal 2003 part 2/VTS_01_4.m4v',
'natal 2003 part 2/VTS_01_3.m4v',
'natal 2003 part 2/VTS_01_5.m4v',
'natal 2003 part 2/VTS_01_1.m4v',
'verao 2004/VTS_01_2.m4v',
'verao 2004/VTS_01_1.m4v',
'verao 2004/VTS_01_3.m4v',
'verao 2004/VTS_01_0.m4v',
'verao 2004/VTS_01_4.m4v',
'verao 2004/VTS_01_5.m4v',
'verao 2005/VTS_01_2.m4v',
'verao 2005/VTS_01_4.m4v',
'verao 2005/VTS_01_5.m4v',
'verao 2005/VTS_01_1.m4v',
'verao 2005/VTS_01_3.m4v',
'verao 2006 part 1/VTS_01_4.m4v',
'verao 2006 part 1/VTS_01_3.m4v',
'verao 2006 part 1/VTS_01_1.m4v',
'verao 2006 part 1/VTS_01_2.m4v',
'verao 2006 part 2/VTS_01_2.m4v',
'verao 2006 part 2/VTS_01_1 (1).m4v',
'huh.mp4',
'2008/VTS_01_1.mp4',
'2008/VTS_01_2.mp4',
'2008/VTS_01_1 natal.mp4',
'2008/VTS_01_2 natal.mp4'

]



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



async function asyncCall(relPath) {
  const fileName = path.basename(relPath);

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
    thumbnail: path.join('static', path.dirname(relPath),`${fileName}-frame-8.png`),
  }).then(function(item){
    console.log("Created item.")
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


  