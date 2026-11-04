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

// Cache clock skew between local machine and real internet time
let cachedClockSkewMs = null;
let lastSyncTime = 0;

/**
 * Get accurate UNIX timestamp (seconds) synchronized with internet time
 * Prevents Cloudinary "Stale request - reported time is more than 1 hour ago" error
 * caused by local computer clock skew / time drift.
 */
export const getAccurateTimestamp = async () => {
  const now = Date.now();
  // Re-sync skew once every 15 minutes or on initial call
  if (cachedClockSkewMs === null || now - lastSyncTime > 15 * 60 * 1000) {
    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/ping", {
        method: "HEAD",
        cache: "no-store",
      }).catch(() => null) || await fetch("https://www.google.com", {
        method: "HEAD",
        cache: "no-store",
      });

      const serverDate = res?.headers?.get("date");
      if (serverDate) {
        const serverMs = new Date(serverDate).getTime();
        cachedClockSkewMs = serverMs - now;
        lastSyncTime = now;
      }
    } catch (e) {
      console.warn("Failed to synchronize time for Cloudinary, falling back to local clock:", e?.message);
      if (cachedClockSkewMs === null) cachedClockSkewMs = 0;
    }
  }

  const accurateMs = Date.now() + (cachedClockSkewMs || 0);
  return Math.floor(accurateMs / 1000);
};

const uploadImage = async (file, folder, options = {}) => {
  const cld = getCloudinary();
  const timestamp = await getAccurateTimestamp();
  const buffer = Buffer.from(await file.arrayBuffer());

  return new Promise((resolve, reject) => {
    cld.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        timestamp,
        ...options,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(buffer);
  });
};

const uploadBase64 = async (base64String, folder, options = {}) => {
  const cld = getCloudinary();
  const timestamp = await getAccurateTimestamp();

  return cld.uploader.upload(base64String, {
    folder,
    resource_type: "image",
    timestamp,
    ...options,
  });
};

export default getCloudinary;
export { uploadImage, uploadBase64 };
