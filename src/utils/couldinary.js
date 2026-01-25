import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  // secure: true, //generates https url generted by copilot
});

export const uploadToCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const uploadResult = await cloudinary.uploader.upload(localFilePath);
    console.log("Cloudinary upload result url:", uploadResult.url);
    // deleting file in case of success syncronously before sending response to ensure the file is deleted
    fs.unlinkSync(localFilePath);
    return uploadResult;
  } catch (error) {
    console.log("Error uploading to Cloudinary:", error);
    fs.unlinkSync(localFilePath); //delete the local file in case of error
    return null;
  }
};
