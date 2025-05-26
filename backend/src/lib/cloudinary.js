import cloudinary from "cloudinary";
import dotenv from "dotenv";
dotenv.config();
// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload configuration for profile pictures
const uploadToCloudinary = async (file,folder) => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: `chatty/${folder}`,
      use_filename: true,
      unique_filename: true,
      overwrite: true,
      resource_type: 'auto'
    });
    return result;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

export {uploadToCloudinary};
