import { Body, JsonController, Post } from 'routing-controllers';

import { ImageService } from '../../services/ImageService';
import { ImageUrlResponse, UploadImageRequest } from '../../types';
import { OpenAPI } from 'routing-controllers-openapi';

@JsonController('image/')
export class ImageController {
  private imageService: ImageService;

  constructor(imageService: ImageService) {
    this.imageService = imageService;
  }

  @Post()
  @OpenAPI({
    summary: 'Upload image',
    description: 'Uploads an image to the server',
    responses: {
      '200': { description: 'Image uploaded successfully' },
      '400': { description: 'Invalid request body' }
    }
  })
  async uploadImage(@Body({ options: { limit: process.env.UPLOAD_SIZE_LIMIT } }) uploadImageRequest: UploadImageRequest): Promise<ImageUrlResponse> {
    return { image: await this.imageService.uploadImage(uploadImageRequest) };
  }
}