import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_KEY_SECRET,
});

const uploadFileOnCloudinary = async (filePath) => {
  try {
    const res = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });
    console.log("Uploading file Successfully ", res);
    fs.unlinkSync(filePath);
    return res;
  } catch (err) {
    console.log("Error uploading file", err);
    fs.unlinkSync(filePath);
  }
};

export { uploadFileOnCloudinary };
