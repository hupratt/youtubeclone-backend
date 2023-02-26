const path = require('path');
const fileUploadConfig = require('../../config/file-upload-config').fileUploadConfig;
const handleDb = require('../../db/handle-db');
const multer  = require('multer');
const {
  Video,
} = require("../sequelize");
const asyncHandler = require("../middlewares/asyncHandler");

module.exports.initUploadPage = function(req, res) {
  res.sendFile(path.resolve(__dirname + '/../../public/video_upload_test.html'));
}

module.exports.uploadFile = function(req, res) {
  var upload = multer(fileUploadConfig).single('user-file');
  upload(req, res, function(uploadError){
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
    const fileId = req.file.filename.split('-')[0];
    const link = 'http://' + req.hostname + ':' + process.env.PORT + '/video/' + fileId

    res.json({
      success: true,
      link: link
    });
    // const attributesToBeSaved = {
    //   id: fileId,
    //   name: req.file.originalname,
    //   size: req.file.size,
    //   path: req.file.path,
    //   encoding: req.file.encoding,
    //   details: req.body.details ? req.body.details : ''
    // }
    const attributesToBeSaved = {
      id: fileId,
      title: req.file.originalname,
      description: '',
      size: req.file.size,
      path: req.file.path,
      encoding: req.file.encoding,
      details: req.body.details ? req.body.details : ''
    }
    handleDb.saveToDB(attributesToBeSaved);
    // return res.send(req.file);
  });
}



// exports.newVideo = asyncHandler(async (req, res, next) => {
//   const video = await Video.create({
//     ...req.body,
//     userId: req.user.id,
//   });

//   res.status(200).json({ success: true, data: video });
// });


// id: {
//   type: DataTypes.UUID,
//   primaryKey: true,
//   allowNull: false,
//   defaultValue: Sequelize.UUIDV4,
// },
// title: {
//   type: DataTypes.STRING,
//   allowNull: false,
// },
// description: {
//   type: DataTypes.STRING,
// },
// url: {
//   type: DataTypes.STRING,
//   allowNull: false,
// },
// thumbnail: {
//   type: DataTypes.STRING,
//   allowNull: false,
// },
// });