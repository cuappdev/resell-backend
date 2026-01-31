import { Service } from "typedi";

import { UploadImageRequest } from "../types";
import { uploadImage } from "../utils/Requests";

@Service()
export class ImageService {
  public async uploadImage(
    uploadImageRequest: UploadImageRequest,
  ): Promise<string> {
    const image = await uploadImage(uploadImageRequest.imageBase64);
    return image.data;
  }
}
