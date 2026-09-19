const cloudinary = require('cloudinary').v2;
const fs = require('fs');

class CloudinaryProvider {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadVideo(file) {
    if (!file) return null;
    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: 'video',
      folder: 'viora/videos',
      chunk_size: 6000000,
    });

    // Cleanup local temp file
    if (fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
      } catch (e) {}
    }

    return {
      url: result.secure_url,
      publicId: result.public_id,
      duration: Math.round(result.duration || 0),
    };
  }

  async uploadImage(file) {
    if (!file) return null;
    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: 'image',
      folder: 'viora/thumbnails',
      transformation: [{ width: 1280, height: 720, crop: 'limit' }],
    });

    // Cleanup local temp file
    if (fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
      } catch (e) {}
    }

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  }

  async deleteMedia(publicId, resourceType = 'image') {
    if (!publicId) return;
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    } catch (err) {
      console.warn(`[Cloudinary] Failed to delete ${publicId}:`, err.message);
    }
  }
}

module.exports = new CloudinaryProvider();
