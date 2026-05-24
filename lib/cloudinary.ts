import { v2 as cloudinary } from "cloudinary";

export function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true
  });

  return cloudinary;
}

export async function uploadProductImage(file: string, folder = "wahaj/products") {
  const client = configureCloudinary();

  if (!client) {
    throw new Error("Cloudinary credentials are missing.");
  }

  return client.uploader.upload(file, {
    folder,
    quality: "auto:good",
    fetch_format: "auto",
    transformation: [{ width: 1400, crop: "limit" }]
  });
}
