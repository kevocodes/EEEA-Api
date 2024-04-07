import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryResponse } from './types/cloudinary-response';
import * as sharp from 'sharp';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const streamifier = require('streamifier');

@Injectable()
export class CloudinaryService {
  async uploadFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<CloudinaryResponse> {
    const webpBuffer = await sharp(file.buffer).webp().toBuffer();

    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      streamifier.createReadStream(webpBuffer).pipe(uploadStream);
    });
  }

  async uploadFiles(
    files: Express.Multer.File[],
    folder: string,
  ): Promise<CloudinaryResponse[]> {
    const uploads = files.map((file) => this.uploadFile(file, folder));

    return Promise.all(uploads);
  }

  async deleteFiles(publicIds: string[]): Promise<any> {
    const result = await cloudinary.api.delete_resources(publicIds, {
      type: 'upload',
    });

    return result;
  }
}
