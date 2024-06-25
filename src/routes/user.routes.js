import { Router } from "express";
import {
  changeCurrentPassword,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  logOutUser,
  loginUser,
  refreshAccessToken,
  registerUser,
  updateUserDetails,
} from "../controllers/user.controller.js";
import { upload } from "../midlewares/multar.middleware.js";
import { verifyJWT } from "../midlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);
router.route("/login").post(loginUser);

// secured routes
router.route("/logOut").post(verifyJWT, logOutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/changePassword").post(verifyJWT, changeCurrentPassword);
router.route("/getUserDetails").get(verifyJWT, getCurrentUser);
router.route("/updateUserDetails").post(
  verifyJWT,
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  updateUserDetails
);

router.route("/getUserChannelProfile").get(verifyJWT, getUserChannelProfile);
router.route("/getWatchHistory").get(verifyJWT, getWatchHistory);

export default router;
