import { Router } from "express";
import {
  loginUser,
  regsiterUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserCoverImage,
  updateUserAvatar,
  getUserChannelProfile,
  getWatchHistory,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  // upload gives optiomns to upload single or multiple files using single/array (multiple file in one field)/fields
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  regsiterUser
);

router.route("/login").post(loginUser);

// secured routes i.e routes only accessible to authenticated users having valid JWT token
router.route("/logout").post(verifyJWT, logoutUser);
// we can also use router.use(verifyJWT) to apply this middleware to all routes declared after this line, so we don't have to add it to each route separately
// here we are verifying JWT token in the controller so we can skip verifyJWT middleware here
router.route("/refresh-token").post(refreshAccessToken); // we can use same controller for logout and refresh token as both will clear refresh token from db and cookie

router.route("/change-password").post(verifyJWT, changePassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);
router
  .route("/cover-image")
  .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);
router
  .route("/avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router.route("/c/:username").get(verifyJWT, getUserChannelProfile);
router.route("/history").get(verifyJWT, getWatchHistory);
export default router;
