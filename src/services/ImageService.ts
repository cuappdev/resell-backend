import { Service } from 'typedi';

import { UploadImageRequest } from '../types';
import { uploadImage } from '../utils/Requests';

@Service()
export class ImageService {
  public async uploadImage(uploadImageRequest: UploadImageRequest): Promise<string> {
    try {
      const image = await uploadImage(uploadImageRequest.imageBase64);
      return image.data;
    } catch (error) {
      console.warn('Upload service failed, returning placeholder URL:', error);
      // Return a placeholder if upload service is down
      return 'https://via.placeholder.com/400x300?text=Image+Upload+Failed';
    }
  }
}