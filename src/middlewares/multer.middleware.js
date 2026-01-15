import multer from "multer";

// Configure multer storage (you can customize this as needed)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    // Generate a unique filename
    // const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // cb(null, file.fieldname + "-" + uniqueSuffix);
    // To keep the original file name
    cb(null, file.originalname);
  },
});

export const upload = multer({ storage: storage });
