import { Body, JsonController, Post } from "routing-controllers";

import { ImageService } from "../../services/ImageService";
import { ImageUrlResponse, UploadImageRequest } from "../../types";

@JsonController("image/")
export class ImageController {
  private imageService: ImageService;

  constructor(imageService: ImageService) {
    this.imageService = imageService;
  }

  @Post()
  async uploadImage(
    @Body({ options: { limit: process.env.UPLOAD_SIZE_LIMIT } })
    uploadImageRequest: UploadImageRequest,
  ): Promise<ImageUrlResponse> {
    return { image: await this.imageService.uploadImage(uploadImageRequest) };
  }
}
