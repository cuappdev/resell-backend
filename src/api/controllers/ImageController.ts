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
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['imageBase64'],
            properties: {
              imageBase64: {
                type: 'string',
                format: 'base64',
                description: 'Base64 encoded image data',
                example: '/9j/4AAQSkZJRgABAQEASABIAAD/...'
              }
            }
          }
        }
      }
    },
    responses: {
      '200': {
        description: 'Image uploaded successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                image: {
                  type: 'string',
                  format: 'uri',
                  description: 'URL of the uploaded image',
                  example: 'https://img2.png'
                }
              }
            }
          }
        }
      },
      '400': {
        description: 'Invalid request body or image format'
      },
      '413': {
        description: 'Image file too large'
      }
    }
  })

  async uploadImage(@Body({ options: { limit: process.env.UPLOAD_SIZE_LIMIT } }) uploadImageRequest: UploadImageRequest): Promise<ImageUrlResponse> {
    return { image: await this.imageService.uploadImage(uploadImageRequest) };
  }
}