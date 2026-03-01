import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/couldinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// helper function to generate access token and refresh token for a user
// not using asyncHandler here as this is not a request handler function, it is a helper function which we will call inside request handler functions
// as this function is not directly used as a request handler in routes, it does not have access to req, res, next objects and it is not a middleware function, so we do not need to use asyncHandler here
// it will be user internally only so can use normal async function with try catch block to handle errors and throw ApiError in case of any error which we can catch in the request handler functions where we will call this helper function and handle the error there using asyncHandler
const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save();
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access tokens"
    );
  }
};

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

const loginUser = asyncHandler(async (req, res) => {
  // req.body -> data
  // username or email, password
  // find the user
  // password check
  // access token and refresh token
  // send secure cookies

  const { email, username, password } = req.body;

  // we are checking for email or username, so if both are not present then we will throw error
  // atleast email or username should be present in req.body to find the user
  // if(!(email || username)) {
  // but we want both for now
  if (!email && !username) {
    throw new ApiError(400, "Email or username is required");
  }

  // use $or operator to check for user with given email or username
  // mongoose provides $or operator to perform logical OR operation in queries
  // we can pass an array of conditions to $or operator, and it will return documents that match any of the conditions
  // so it will check for user with given email or username is present and return the user document if found
  const user = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  // user instance method to check password
  // User is model provided by mongoose it will have methods provided by mongoose like findOne, findById etc and also the instance methods we create on userSchema.methods
  // user is the instance of User model which we get after finding the user document in db using findOne method, so it will have access to instance methods we create on userSchema.methods like isPasswordCorrect
  // so the custom methods we create on userSchema.methods will be available on the user instance we get after querying the db,
  // so we can call user.isPasswordCorrect to check if the password is correct or not
  // Note: custom methods are not available on the User model itself, they are only available on the instances of the model which we get after querying the db
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  // generate access token and refresh token
  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user._id);

  // send information to the client/user
  // sending password and refresh token in response is not a good idea for security reasons, so we will not send them in response
  // we can send user data in response using user object as well by setting password and token to null but it is better to query the db again and select only the fields we want to send in response and exclude password and refresh token using select method of mongoose which is more secure approach
  // Note: also in user instance above will not have refresh token it would be empty as it was generated later anyways its not required to send to user,
  // as per the usecase if quering the db again feels expensive then update the existing user instance else do it
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true, // to prevent client side scripts from accessing the cookie for security purpose
    secure: true, // to send cookie only over https in production environment
    // secure: process.env.NODE_ENV === "production", // to send cookie only over https in production environment
    // sameSite: "strict", // to prevent CSRF attacks by not sending cookies in cross site requests
    // maxAge: 7 * 24 * 60 * 60 * 1000, // cookie expiry time in milliseconds (7 days)
  };

  // send access token and refresh token in httpOnly cookies for security purpose
  // and also send user data in response body depends upon the usecase what object you want to send in response
  // Note: we can send access token and refresh token in response body as well but it is not a good idea for security reasons, as it can be accessed by client side scripts and can lead to security vulnerabilities like XSS attacks, so it is better to send them in httpOnly cookies which cannot be accessed by client side scripts
  // but we are sending them in response body as well to handle the usecase  where client/user/FE is trying to set accesstoken/refreshtoken in local storage instead of cookies
  // or possibly response is consumed in mobile app where cookies are not supported, so in that case we can send access token and refresh token in response body as well
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // 1.clear accesstoekn and refresh token cookies from client browser
  // 2.reset the refresh token in db
  // to logout user we will clear the access token and refresh token cookies by setting them to empty string
  // and also set their expiry time to past date so that they get deleted from client browser
  // and also remove refresh token from db for that user so that it cannot be used to generate new access token

  const userId = req.user._id; // we will get user id from req.user which is set by auth middleware after verifying access token
  // await User.findByIdAndUpdate(userId, { refreshToken: "" }); // remove refresh token from db for that user
  // but in our case we want to remove the field from db for that user which is more clean approach, so we can use $unset operator which is used to remove a field from a document, it will remove the field from db for that user
  // await User.findByIdAndUpdate(userId, { $unset: { refreshToken: "" } });
  // set is a mongodb operator which is used to set the value of a field in a document, it will add the field if it does not exist or update the value if it already exists,
  await User.findByIdAndUpdate(
    userId,
    { $set: { refreshToken: undefined } },
    { new: true }
  ); // to remove the refresh token field from db for that user, it is better than setting it to empty string as it will remove the field from db which is more clean approach, but it is optional to do it, we can also set it to empty string or null as well depending upon the usecase and how you want to handle it in your codebase

  // we can also use findById and then save method to remove refresh token
  // then save it with validateBefore which is used to bypass the validation checks like required true etc to false to save in db for that user
  // but it is better to use findByIdAndUpdate method which is more efficient as it performs the update operation in a single query without fetching the user document first and then saving it, so it reduces the number of queries to the database and improves performance

  const options = {
    httpOnly: true, // to prevent client side scripts from accessing the cookie for security purpose
    secure: true, // to send cookie only over https in production environment
  };

  // clear access token and refresh token cookies
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  // 1. get refresh token from cookies
  // 2. verify refresh token
  // 3. check if refresh token is present in db for that user
  // 4. generate new access token and refresh token
  // 5. send new access token and refresh token in httpOnly cookies

  const incomingRefreshToken =
    req.cookies?.refreshToken ||
    req.body.refreshToken ||
    req.header("Authorization")?.replace("Bearer ", ""); // get refresh token from cookies or authorization header

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true, // to prevent client side scripts from accessing the cookie for security purpose
      secure: true, // to send cookie only over https in production environment
    };

    const { accessToken, newRefreshToken } =
      await generateAccessTokenAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changePassword = asyncHandler(async (req, res) => {
  // 1. get old password and new password from req.body
  // 2. check if old password is correct or not using user instance method
  // 3. if old password is correct then set new password to user instance and save it to db which will trigger the pre save hook to hash the new password before saving to db
  // 4. send response to client
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Old password and new password are required");
  }
  const user = await User.findById(req.user._id);

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Old password is incorrect");
  }

  user.password = newPassword; // set new password to user instance, this will trigger the pre save hook to hash the new password before saving to db
  await user.save({ validateBeforeSave: false }); // save the user instance to db without validating the checks for other fields
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  // as we are using auth middleware to protect this route, so we will have access to req.user which is set by auth middleware after verifying access token, so we can send that user data in response
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

// to update any file keep separate end point is better approach in production level codebase
// as updating account details and updating profile picture or cover image are different usecases and can be handled separately, as updating profile picture or cover image will involve handling file upload and integration with cloudinary or any other service, so it is better to keep them separate for better code organization and maintainability
// if we update whole user in same endpoint then text user data will also go along the file everytime which may not be required and can lead to network congestion
//  this is for updating text based details
const updateAccountDetails = asyncHandler(async (req, res) => {
  // to update account details like fullname, email, username, avatar, cover image etc
  // we can update them in user document in db and send the updated user data in response
  // we can also handle the image upload if there is any new image for avatar or cover image and update the url in db as well

  const { fullName, email } = req.body;
  if (!fullName || !email) {
    throw new ApiError(400, "Full name and email are required");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    { new: true } // to return the updated user document instead of the old one
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  // to update user avatar
  // we can handle the file upload using multer middleware and then upload the file to cloudinary and get the url and update the user document in db with new avatar url and send the updated user data in response
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar image is required");
  }

  const avatar = await uploadToCloudinary(avatarLocalPath);

  if (!avatar?.url) {
    throw new ApiError(400, "Error while uploading avatar image");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  // to update user cover image
  // we can handle the file upload using multer middleware and then upload the file to cloudinary and get the url and update the user document in db with new cover image url and send the updated user data in response
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover image is required");
  }

  const coverImage = await uploadToCloudinary(coverImageLocalPath);

  if (!coverImage?.url) {
    throw new ApiError(400, "Error while uploading cover image");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover image updated successfully"));
});

export {
  regsiterUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
};
