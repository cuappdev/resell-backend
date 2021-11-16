// import { getRepository, Repository } from "typeorm";

// import Image from "../models/ImageModel";
// import Post from "../models/PostModel";
// import User from "../models/UserModel";

// const repo = (): Repository<Image> => getRepository(Image);

// async function getImageById(id: string): Promise<Image | undefined> {
//   return await repo().findOne(id);
// }


// async function createImage(
//   url: string,
//   post: Post
// ): Promise<Image> {
//   const image = repo().create({
//     url,
//     post
//   });
//   await repo().save(image);
//   return image;
// }

// async function deleteImage(image: Image): Promise<boolean> {
//   await repo().delete(image);
//   return true;
// }

// export default {
//   getImageById,
//   createImage,
//   deleteImage
// };