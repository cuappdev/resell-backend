import { FeedbackModel } from "src/models/FeedbackModel";

import { AvailabilityList, Uuid } from ".";
import { PostModel } from "../models/PostModel";
import { UserModel } from "../models/UserModel";
import { ReportModel } from "../models/ReportModel";
import { MessageModel } from "../models/MessageModel";

// RESPONSE TYPES

export interface ErrorResponse {
  error: string;
  httpCode: number;
}

// USER

export interface PublicProfile {
  firebaseUid: string;
  username: string;
  netid: string;
  givenName: string;
  familyName: string;
  stars: number;
  numReviews: number;
  photoUrl: string;
  venmoHandle: string;
  bio: string;
  posts: PostModel[];
}

export interface PrivateProfile extends PublicProfile {
  admin: boolean;
  email: string;
  googleId: string;
  isActive: boolean;
  feedbacks: FeedbackModel[];
  blockers: UserModel[] | undefined;
  blocking: UserModel[] | undefined;
  reports: ReportModel[] | undefined;
  reportedBy: ReportModel[] | undefined;
  // sentMessages: MessageModel[];
  // receivedMessages: MessageModel[];
}

export interface GetUsersResponse {
  users: PrivateProfile[];
}

export interface GetUserResponse {
  user: PrivateProfile | undefined;
}

// CATEGORY

export interface Category {
  id: Uuid;
  name: string;
  posts: PostModel[];
}

export interface GetCategoryResponse {
  categories: Category;
}

// POST

export interface Post {
  id: Uuid;
  title: string;
  description: string;
  condition: string;
  original_price: number;
  altered_price: number;
  images: string[];
  created: Date;
  location: string;
  archive: boolean;
  user: PrivateProfile;
  savers: PrivateProfile[];
  matched: Request[];
  categories: Category[];
  sold: boolean;
}

export interface GetPostsResponse {
  posts: Post[];
}

export interface GetPostResponse {
  post: Post;
}

export interface IsSavedPostResponse {
  isSaved: boolean;
}

export interface EditPriceResponse {
  new_price: number;
}

// MESSAGES

export interface Message {
  id: Uuid;
  sender: PrivateProfile;
  receiver: PrivateProfile;
  content: string;
  timestamp: Date;
}

// FEEDBACK

export interface Feedback {
  id: Uuid;
  description: string;
  images: string[];
  user: PrivateProfile;
}

export interface GetFeedbacksResponse {
  feedbacks: Feedback[];
}

export interface GetFeedbackResponse {
  feedback: Feedback;
}


// IMAGES

export interface ImageUrlResponse {
  image: string;
}

// REQUESTS

export interface Request {
  id: Uuid;
  title: string;
  description: string;
  archive: boolean;
  user: PrivateProfile;
  matches: PostModel[];
}

export interface GetRequestsResponse {
  requests: Request[];
}

export interface GetRequestResponse {
  request: Request;
}

// USER REVIEWS

export interface UserReview {
  id: Uuid;
  fulfilled: boolean;
  stars: number;
  comments: string;
  date: Date;
  buyer: PrivateProfile;
  seller: PrivateProfile;
}

export interface GetUserReviewResponse {
  userReview: UserReview;
}

export interface GetUserReviewsResponse {
  userReviews: UserReview[];
}

// REPORTS
export interface Report {
  id: Uuid;
  reporter: PrivateProfile;
  reported: PrivateProfile;
  post?: PostModel;
  message?: MessageModel;
  reason: string;
  type: "post" | "profile" | "message";
  resolved: boolean;
  created: Date;

}

export interface GetReportResponse {
  report: Report;
}

export interface GetReportsResponse {
  reports: Report[];
}

//CHATS

export interface MessageResponse {
  type: string,
  senderID: Uuid,
  text: string,
  images: string[],
  timestamp: Date,
  read: boolean

}

export interface AvailabilityResponse {
  type: string,
  senderID: Uuid,
  timestamp: Date,
  availabilities: AvailabilityList[]

}

export interface ProposalResponse {
  type: string,
  senderID: Uuid,
  timestamp: Date,
  accepted:boolean|null,
  startDate:Date,
  endDate:Date

}

export interface ChatReadResponse {
  read:boolean

}