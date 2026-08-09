import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

let isConfigured = false;

const requiredEnv = (key: string) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} is required for Cloudinary uploads`);
  }

  return value;
};

const configureCloudinary = () => {
  if (isConfigured) return;

  cloudinary.config({
    cloud_name: requiredEnv("CLOUDINARY_CLOUD_NAME"),
    api_key: requiredEnv("CLOUDINARY_API_KEY"),
    api_secret: requiredEnv("CLOUDINARY_API_SECRET"),
    secure: true,
  });

  isConfigured = true;
};

export const uploadImageFromUrl = async (
  imageUrl: string,
  folder: string,
): Promise<UploadApiResponse> => {
  configureCloudinary();

  return cloudinary.uploader.upload(imageUrl, {
    folder,
    resource_type: "image",
  });
};
