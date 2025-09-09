// UserFactory.ts
import { define } from 'typeorm-seeding';
import { UserModel } from '../models/UserModel';

// Define a factory for UserModel
define(UserModel, (_, context?: { index?: number }) => {
  const user = new UserModel();
  const index = context?.index ?? 1; // Default to 1 if context or index is undefined

  user.firebaseUid = `firebase_uid_${index}`;
  user.username = `user${index}`;
  user.netid = `netid${index}`;
  user.givenName = `GivenName${index}`;
  user.familyName = `FamilyName${index}`;
  user.admin = index === 1;  // Make the first user an admin
  user.isActive = true;
  user.stars = 0;
  user.numReviews = 0;
  user.photoUrl = `http://example.com/photo${index}.jpg`;
  user.venmoHandle = `venmo${index}`;
  user.email = `user${index}@example.com`;
  user.googleId = `googleId${index}`;
  user.bio = `This is the bio of user${index}`;

  return user;
});
