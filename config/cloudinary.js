const cloudinary = require('cloudinary');
// const cloudinaryStorage = require('multer-storage-cloudinary');
// const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.CLOUDKEY,
  api_secret: process.env.CLOUDSECRET
});

// const storage = cloudinaryStorage({
//   cloudinary,
//   folder: 'newsify',
//   allowedFormats: ['jpg', 'png'],
//   filename: function (req, file, cb) {
//     cb(null, file.originalname);
//   }
// });

// const uploadCloud = multer({ storage });

module.exports = cloudinary;