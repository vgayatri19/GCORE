const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Init upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // 10MB
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

// Check file type
function checkFileType(file, cb) {
    // Allowed extensions
    const filetypes = /csv|xlsx/;
    // Check extension
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype || extname) {
        return cb(null, true);
    } else {
        cb('Error: Only CSV/Excel Files Allowed!');
    }
}

module.exports = upload;
