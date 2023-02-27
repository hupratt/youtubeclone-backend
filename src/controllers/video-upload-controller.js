const path = require('path');
const fileUploadConfig = require('../../config/file-upload-config').fileUploadConfig;
const handleDb = require('../../db/handle-db');
const multer  = require('multer');
const uuid = require('uuid');
const {
  Video,
} = require("../sequelize");
const asyncHandler = require("../middlewares/asyncHandler");
var ffmpeg = require('fluent-ffmpeg');

module.exports.getThumbnail = function(req, res) {
  res.sendFile(path.resolve(__dirname + `/../../uploads/${req.params.filename}`));
}

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
        error: errorMessage
      });
    }
    
    await ffmpeg(req.file.path)
    .screenshots({
      // Will take screens at 20%, 40%, 60% and 80% of the video
      count: 4,
      folder: 'uploads',
      filename: `${req.file.originalname}.png` 
    });
    const video = await Video.create({
      id: uuid.v4(),
      title: req.file.originalname,
      description: '',
      url: req.file.path,
      thumbnail: `${req.file.originalname}_1.png`,
      createdAt: null,
      updatedAt: null,
      userId: req.user.id,
    });
    
    res.status(200).json({ success: true, data: video });
  });
}

exports.newVideo = asyncHandler(async (req, res, next) => {
  const video = await Video.create({
    ...req.body,
    userId: req.user.id,
  });

  res.status(200).json({ success: true, data: video });
});
