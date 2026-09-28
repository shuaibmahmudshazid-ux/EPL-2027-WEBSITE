import { v2 as cloudinary } from "cloudinary";

const getCloudinary = () => {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary environment variables are not configured.");
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });

  return cloudinary;
};

const uploadImage = async (file, folder) => {
  const cloudinary = getCloudinary();
  const buffer = Buffer.from(await file.arrayBuffer());
  return new Promise((resolve, reject) => cloudinary.uploader.upload_stream({ folder, resource_type: "image" }, (error, result) => error ? reject(error) : resolve(result)).end(buffer));
};

export default getCloudinary;
export { uploadImage };
