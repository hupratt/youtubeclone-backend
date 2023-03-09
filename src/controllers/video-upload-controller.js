const path = require('path');
const fileUploadConfig = require('../../config/file-upload-config').fileUploadConfig;
const handleDb = require('../../db/handle-db');
const multer  = require('multer');
const uuid = require('uuid');
const {
  Video,
} = require("../sequelize");
var ffmpeg = require('fluent-ffmpeg');


module.exports.uploadFile = function(req, res) {
  var upload = multer(fileUploadConfig).single('file');
  upload(req, res, async function(uploadError){
    if(uploadError){
      var errorMessage;
      if(uploadError.code === 'LIMIT_FILE_TYPE') {
        errorMessage = uploadError.errorMessage;
      } else if(uploadError.code === 'LIMIT_FILE_SIZE'){
          errorMessage = 'Maximum file size allowed is ' + process.env.FILE_SIZE + 'MB';
      }
      return res.json({
        error: "unknown error throw"
      });
    }
    // console.log('=== req.file.path video-upload-controller.js [24] ===', req.file.path);
    // console.log('=== req.file.originalname video-upload-controller.js [25] ===', req.file.originalname);
    // console.log('=== req.user.id video-upload-controller.js [26] ===', req.user.id);
    await ffmpeg(req.file.path)
    .screenshots({
      // Will take screens at 20%, 40%, 60% and 80% of the video
      count: 4,
      folder: 'public/uploads',
      filename: `${req.file.originalname}.png` 
    });
    const video = await Video.create({
      id: uuid.v4(),
      title: req.file.originalname,
      description: '',
      url: req.file.path.replace("public/",""),
      thumbnail: `uploads/${req.file.originalname}_1.png`,
      createdAt: null,
      updatedAt: null,
      userId: req.user.id,
    });
    
    res.status(200).json({ success: true, data: video });
  });
}
