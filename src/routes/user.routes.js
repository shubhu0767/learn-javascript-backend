import { Router } from "express";
import {
  changeCurrentPassword,
  getCurrentUser,
  logOutUser,
  loginUser,
  refreshAccessToken,
  registerUser,
  updateUserDetails,
} from "../controllers/user.controller.js";
import { upload } from "../midlewares/multar.middleware.js";
import { getTrendingMovies } from "../controllers/movie.controller.js";
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
// router.route('/movie').get(getTrendingMovies)

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

export default router;
