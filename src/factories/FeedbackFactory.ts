// FeedbackFactory.ts
import { define } from 'typeorm-seeding';
import { FeedbackModel } from '../models/FeedbackModel';
import { UserModel } from '../models/UserModel';

// Define a factory for FeedbackModel
define(FeedbackModel, (_, context?: { index?: number, user?: UserModel }) => {
  if (context === undefined || context.user === undefined || context.index === undefined)
    throw "Context and context.user cannot be undefined";

  const feedback = new FeedbackModel();
  const index = context.index;

  feedback.user = context.user;

  // Use consistent data for feedback fields, utilizing index for uniqueness
  feedback.description = `This is a feedback ${index} description for user ${feedback.user.givenName}`;
  feedback.images = [
    `http://example.com/feedback_${feedback.user.givenName}_image_${index}_1.jpg`,
    `http://example.com/feedback_${feedback.user.givenName}_image_${index}_2.jpg`
  ];

  return feedback;
});