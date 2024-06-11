import { ApiError } from "../utilis/ApiError.js";
import { asyncHandler } from "../utilis/asyncHandler.js";
import { ApiResponse } from "../utilis/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadFileOnCloudinary } from "../utilis/cloudnary.js";
import jwt from "jsonwebtoken";

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, userName, email, phoneNumber, password } = req.body;
  console.log("Body:- ", req.body);

  if ([fullName, email, password].some((feild) => feild.trim() === "")) {
    throw new ApiError(400, "Invalid data");
  }

  const existedUser = await User.findOne({
    $or: [{ email }, { userName }],
  });

  if (existedUser) {
    throw new ApiError(400, "User already exists");
  }

  const avatorLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0]?.path;
  }

  if (!avatorLocalPath) {
    throw new ApiError(400, "No avator Image");
  }
  const avatar = await uploadFileOnCloudinary(avatorLocalPath);
  const coverImage =
    coverImageLocalPath && (await uploadFileOnCloudinary(coverImageLocalPath));

  console.log(avatar);
  if (!avatar) {
    throw new ApiError(400, "No avator Image");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || null,
    email,
    password,
    phoneNumber,
    userName: userName.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshTokens"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, createdUser, "User created successfully"));
});

const generateTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshTokens = refreshToken;
    await user.save({ validiateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (err) {
    throw new ApiError(500, "something went wrong while generating tokens");
  }
};

const loginUser = asyncHandler(async (req, res) => {
  // check userName and password are not empty.
  // find user and validate userName and password
  // generate access & refresh tokens
  // send in cookies & throw success message

  const { userName, password } = req.body;
  console.log(req.body);
  if (!userName && !password)
    throw new ApiError(403, "userName and password is required");

  const existedUser = await User.findOne({
    $or: [{ userName }],
  });

  if (!existedUser) {
    throw new ApiError(400, "User does not exists");
  }

  const isPasswordCorrect = await existedUser.isPasswordValid(password);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "user password is incorrect");
  }

  const { accessToken, refreshToken } = await generateTokens(existedUser._id);

  const loggedInUser = await User.findById(existedUser._id).select(
    "-password -refreshTokens"
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logOutUser = asyncHandler(async (req, res) => {
  //

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        refreshTokens: null,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out Successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  // get refresh token form cookie
  // find user by refresh token
  // generate new access token
  // send access token in cookie
  // throw success message

  const oldRefreshToken = req.cookies.refreshToken;
  if (!oldRefreshToken) {
    throw new ApiError(401, "Unauthorized Request");
  }

  const decodedToken = jwt.verify(
    oldRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  console.log(decodedToken);

  const user = await User.findById(decodedToken._id);

  if (!user) {
    throw new ApiError(401, "invalid refresh Token");
  }
  console.log(user);

  if (oldRefreshToken !== user?.refreshTokens) {
    throw new ApiError(401, "Refresh Token is expired");
  }

  const { accessToken, refreshToken } = await generateTokens(user._id);

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken },
        "Access Token generated successfully"
      )
    );
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  // need to get old password and new password
  // check old password is valid if true then
  // change current password to new password

  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);

  const isPasswordValid = await user.isPasswordValid(oldPassword);
  console.log(">>", isPasswordValid);
  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid Old Password");
  }

  user.password = newPassword;

  await user.save({ validiateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, user, "password updated successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  console.log("user", req.user);
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User details fetched successfully"));
});

const updateUserDetails = asyncHandler(async(req, res) => {

  const { user } = req;
  // const user = await User.findById(req.user?._id)

  let avatorLocalPath;
  let coverImageLocalPath;

  if (
    req.files &&
    Array.isArray(req.files.avatar) &&
    req.files.avatar.length > 0
  ) {
    avatorLocalPath = req.files?.avatar[0]?.path;
  }

  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0]?.path;
  }

  const avatar = avatorLocalPath && await uploadFileOnCloudinary(avatorLocalPath);
  
  const coverImage =
    coverImageLocalPath && (await uploadFileOnCloudinary(coverImageLocalPath));

  const newUserObj = {
    fullName: req.body.fullName || user.fullName,
    avatar: avatar?.url || user.avatar,
    coverImage: coverImage?.url || user.coverImage,
    email: req.body.email || user.email,
    phoneNumber: req.body.phoneNumber || user.phoneNumber,
    userName: req.body.userName || user.userName,
    }
    
    // user.fullName = req.body.fullName || user.fullName
    // user.avatar = req.body.avatar || user.avatar
    // user.coverImage= req.body.coverImage || user.coverImage
    // user.email= req.body.email || user.email
    // user.phoneNumber= req.body.phoneNumber || user.phoneNumber
    // user.userName= req.body.userName || user.userName

    // await user.save({ validiateBeforeSave: false });

  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    newUserObj,
    {
      new: true,
    }
  ).select("-password -refreshTokens");

  console.log(updatedUser);

  return res
   .status(200)
   .json(new ApiResponse(200, updatedUser, "User details updated successfully"));
})

export {
  registerUser,
  loginUser,
  logOutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateUserDetails,
};
