import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/couldinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const regsiterUser = asyncHandler(async (req, res) => {
  // Extract user data from req.body
  // validate all the data
  // check if user already exists: username, email
  // check for images, check for avatar
  // upload them to cloudinary or any other service
  // create user object - create entry in db
  // remove password and refresh tokenfrom user object before sending response
  // check for user creation success
  // return response to client

  const { fullName, email, username, password } = req.body;

  // Simple validation
  if (
    [fullName, email, username, password].some((field) => field.trim() === "")
  ) {
    throw new ApiError(400, "Name, email, username, and password are required");
  }

  // use $or operator to check for existing user with same email or username
  // by passing an array of conditions with objects
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });

  if (existingUser) {
    throw new ApiError(409, "User with given email or username already exists");
  }

  // to check images
  // express gives us access to req.body similarly for files multer gives us access to req.files
  // middleware adds additional property files to req object
  // middleware multer will parse the incoming multipart/form-data request
  // and will populate req.files with the uploaded files information
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // this gives error of cannot read 0 index, if coverImage is not present in req.files
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  // use pure js logic to check
  // let coverImageLocalPath;
  // if (
  //   req.files &&
  //   Array.isArray(req.files.coverImage) &&
  //   req.files.coverImage.length > 0
  // ) {
  //   coverImageLocalPath = req.files.coverImage;
  // }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  // upload to cloudinary
  const avatar = await uploadToCloudinary(avatarLocalPath);
  const coverImage = coverImageLocalPath
    ? await uploadToCloudinary(coverImageLocalPath)
    : null;

  if (!avatar) {
    throw new ApiError(500, "Error in uploading avatar image");
  }

  // create user object and save to db
  const newUser = await User.create({
    fullname: fullName,
    email,
    username: username.toLowerCase(),
    password,
    avatar: avatar?.url,
    coverImage: coverImage?.url || "",
  });

  // to verify if user creater successfully as well as send user data in resp
  // can send user data in resp using newUser as well by setting password and token to null
  const createdUser = await User.findById(newUser._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Error in creating user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

export { regsiterUser };
