// PostFactory.ts
import { define } from 'typeorm-seeding';
import { PostModel } from '../models/PostModel';
import { UserModel } from '../models/UserModel';

// Define a factory for PostModel
define(PostModel, (_, context?: { index?: number, user?: UserModel }) => {
  if (context === undefined || context.user === undefined || context.index === undefined)
    throw "Context and context.user cannot be undefined"

  const post = new PostModel();
  const index = context.index; // Default to 1 if context or index is undefined
  
  post.user = context.user;

  // Use consistent data for post fields, utilizing index for uniqueness
  post.title = `Sample Post Title - User ${post.user.givenName} - Index: ${index}`;
  post.description = `This is a sample description for post - User ${post.user.givenName} - Index: ${index}.`;
  post.categories = ['Electronics', 'Books'];
  post.original_price = 100.00 + index;
  post.altered_price = 80.00 + index;
  post.images = [
    `http://example.com/image_${post.user.givenName}_${index}_1.jpg`,
    `http://example.com/image_${post.user.givenName}_${index}_2.jpg`,
    `http://example.com/image_${post.user.givenName}_${index}_3.jpg`
  ];
  post.created = new Date('2023-01-01T00:00:00Z');
  post.location = `Sample City  - User ${post.user.givenName} - ${index}`;
  post.archive = index % 2 === 0; // Alternate between true and false for archive

  return post;
});