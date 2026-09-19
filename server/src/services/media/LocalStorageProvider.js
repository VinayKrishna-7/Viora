const fs = require('fs');
const path = require('path');

class LocalStorageProvider {
  constructor() {
    this.uploadsDir = path.resolve(__dirname, '../../../uploads');
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async uploadVideo(file) {
    if (!file) return null;
    const filename = path.basename(file.path);
    const url = `/uploads/${filename}`;
    return {
      url,
      publicId: filename,
      duration: 0, // Fallback duration if FFmpeg probe is not available locally
    };
  }

  async uploadImage(file) {
    if (!file) return null;
    const filename = path.basename(file.path);
    const url = `/uploads/${filename}`;
    return {
      url,
      publicId: filename,
    };
  }

  async deleteMedia(publicId) {
    if (!publicId) return;
    const filePath = path.join(this.uploadsDir, publicId);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.warn(`[LocalStorage] Failed to remove local file ${publicId}:`, err.message);
      }
    }
  }
}

module.exports = new LocalStorageProvider();
