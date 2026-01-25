import { Router } from "express";
import { regsiterUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/register").post(
  // upload gives optiomns to upload single or multiple files using single/array (multiple file in one field)/fields
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  regsiterUser
);

export default router;
