import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import { v4 as uuidv4 } from 'uuid';
import { MultipartFile } from '@fastify/multipart';

export class FileUploadService {
  private allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  private maxFileSize = 10 * 1024 * 1024; // 10MB

  async uploadFile(part: MultipartFile, folder: 'machines' | 'operators' | 'customers' | 'documents'): Promise<{ fileName: string; relativePath: string }> {
    if (!this.allowedMimeTypes.includes(part.mimetype)) {
      throw new Error(`Unsupported file type: ${part.mimetype}. Allowed: JPG, PNG, WEBP, PDF`);
    }

    const uploadDir = path.resolve(process.cwd(), 'uploads', folder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(part.filename) || '.jpg';
    const safeFileName = `${uuidv4()}${ext}`;
    const destination = path.join(uploadDir, safeFileName);

    await pipeline(part.file, fs.createWriteStream(destination));

    return {
      fileName: safeFileName,
      relativePath: `/uploads/${folder}/${safeFileName}`,
    };
  }

  async deleteFile(relativePath: string): Promise<boolean> {
    try {
      // Prevent directory traversal
      const safePath = path.normalize(relativePath).replace(/^(\.\.[\/\\])+/, '');
      const fullPath = path.resolve(process.cwd(), safePath.startsWith('/') ? safePath.slice(1) : safePath);

      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}

export default new FileUploadService();
