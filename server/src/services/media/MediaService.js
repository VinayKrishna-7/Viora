const cloudinaryProvider = require('./CloudinaryProvider');
const localStorageProvider = require('./LocalStorageProvider');

class MediaService {
  constructor() {
    this.isCloudinaryConfigured = Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );
  }

  getProvider() {
    return this.isCloudinaryConfigured ? cloudinaryProvider : localStorageProvider;
  }

  async uploadVideo(file) {
    return await this.getProvider().uploadVideo(file);
  }

  async uploadImage(file) {
    return await this.getProvider().uploadImage(file);
  }

  async deleteMedia(publicId, resourceType = 'image') {
    return await this.getProvider().deleteMedia(publicId, resourceType);
  }
}

module.exports = new MediaService();
