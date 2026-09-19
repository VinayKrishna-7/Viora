const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const isCloudinaryConfigured = () => {
  return (
    Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
    Boolean(process.env.CLOUDINARY_API_KEY) &&
    Boolean(process.env.CLOUDINARY_API_SECRET)
  );
};

/**
 * Upload local file to Cloudinary with local storage fallback
 * @param {string} localFilePath - Path to temp file on server disk
 * @param {object} options - Cloudinary upload options (resource_type, folder, etc.)
 */
const uploadMedia = async (localFilePath, options = {}) => {
  if (!localFilePath) return null;

  try {
    // If Cloudinary credentials are configured, upload to Cloudinary CDN
    if (isCloudinaryConfigured()) {
      const response = await cloudinary.uploader.upload(localFilePath, {
        resource_type: options.resource_type || 'auto',
        folder: options.folder || 'viora',
        ...options,
      });

      // Safely remove temp file from disk after successful Cloudinary upload
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }

      return {
        url: response.secure_url,
        publicId: response.public_id,
        duration: response.duration || 0,
      };
    }

    // Fallback for development without Cloudinary credentials:
    // Keep file in uploads directory and return local accessible URL
    const filename = path.basename(localFilePath);
    const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
    const localUrl = `${serverUrl}/uploads/${filename}`;

    return {
      url: localUrl,
      publicId: `local_${filename}`,
      duration: options.resource_type === 'video' ? 120 : 0, // default simulated duration
    };
  } catch (error) {
    // Delete temp file if upload threw an error
    if (fs.existsSync(localFilePath)) {
      try {
        fs.unlinkSync(localFilePath);
      } catch (unlinkErr) {
        console.error('Error removing temp file:', unlinkErr.message);
      }
    }
    throw error;
  }
};

/**
 * Delete asset from Cloudinary or local uploads
 */
const deleteMedia = async (publicId, resourceType = 'image') => {
  if (!publicId) return;

  try {
    if (publicId.startsWith('local_')) {
      const filename = publicId.replace('local_', '');
      const filePath = path.resolve(__dirname, '../../uploads', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return;
    }

    if (isCloudinaryConfigured()) {
      await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });
    }
  } catch (error) {
    console.error(`Error deleting media (${publicId}):`, error.message);
  }
};

module.exports = {
  cloudinary,
  uploadMedia,
  deleteMedia,
  isCloudinaryConfigured,
};
