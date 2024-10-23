// RequestFactory.ts
import { define } from 'typeorm-seeding';
import { RequestModel } from '../models/RequestModel';
import { UserModel } from '../models/UserModel';
import { PostModel } from '../models/PostModel';

// Define a factory for RequestModel
define(RequestModel, (_, context?: { index?: number, user?: UserModel, matches?: PostModel[] }) => {
  if (context === undefined || context.user === undefined || context.index === undefined)
    throw "Context, user, and index cannot be undefined";

  const request = new RequestModel();
  const index = context.index;

  request.user = context.user;
  request.matches = context.matches ?? [];

  // Use consistent data for request fields, utilizing index for uniqueness
  request.title = `Sample Request Title ${index}`;
  request.description = `This is a sample description for request ${index}.`;

  return request;
});
