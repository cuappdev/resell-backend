import { Uuid } from '.';
import { MessageModel } from '../models/MessageModel';

// REQUEST TYPES

// AUTH

export interface GoogleLoginUser {
    id: string;
    email: string;
    familyName: string;
    givenName: string;
    name: string;
    photoUrl: string;
}

export interface AuthRequest {
    idToken: string;
    user: GoogleLoginUser;
    deviceToken: string;
}

export interface EditProfileRequest {
    photoUrlBase64: string | undefined;
    username: string | undefined;
    venmoHandle: string | undefined;
    bio: string | undefined;
}

export interface CreateUserRequest {
    username: string;
    netid: string;
    givenName: string;
    familyName: string;
    photoUrl: string;
    venmoHandle: string;
    email: string;
    googleId: string;
    bio: string;
}

// USER

export interface GetUserByEmailRequest {
    email: string;
}

export interface SetAdminByEmailRequest {
    email: string;
    status: boolean;
}

export interface BlockUserRequest {
    blocked: Uuid;
}

export interface UnblockUserRequest {
    unblocked: Uuid;
}

// POST

export interface CreatePostRequest {
    title: string;
    description: string;
    categories: string[];
    original_price: number;
    imagesBase64: string[];
    userId: Uuid;
}

export interface GetSearchedPostsRequest {
    keywords: string;
}

export interface EditPostPriceRequest {
    new_price: number;
}

// FEEDBACK

export interface CreateFeedbackRequest {
    description: string;
    images: string[];
    userId: Uuid;
}

export interface GetSearchedFeedbackRequest {
    keywords: string;
}

export interface FilterPostsRequest {
    category: string;
}

export interface FilterPostsByPriceRequest {
    lowerBound: number;
    upperBound: number;
}

// GENERAL IMAGES

export interface UploadImageRequest {
    imageBase64: string;
}

// REQUEST

export interface CreateRequestRequest {
    title: string;
    description: string;
    archive: boolean;
    userId: Uuid;
}

// USER REVIEW

export interface CreateUserReviewRequest {
    fulfilled: boolean,
    stars: number,
    comments: string,
    buyerId: Uuid,
    sellerId: Uuid,
}
// NOTIFICATION
export interface ExpoPushMessage {
    to: string[];
    //special type for ExpoPushMessage
    sound: 'default';
    title: string;
    body: string;
    data: JSON;
}

export interface SaveTokenRequest {
    token: string;
    userId: Uuid;
}

export interface FindTokensRequest {
    email: string;
    title: string;
    body: string;
    data: JSON;
}

// REPORTS
export interface ReportPostRequest {
    reported: Uuid;
    post: Uuid;
    reason: string;
}
  
export interface ReportProfileRequest {
    reported: Uuid;
    reason: string;
}
  
export interface ReportMessageRequest {
    reported: Uuid;
    message: MessageModel;
    reason: string;
}

// TRANSACTIONS
export interface CreateTransactionRequest {
    location: string;
    amount: number;
    transactionDate: Date;
    postId: Uuid;
    buyerId: Uuid;
    sellerId: Uuid;
}

export interface UpdateTransactionStatusRequest {
    completed: boolean;
}

export interface CreateTransactionReviewRequest {
    transactionId: Uuid;
    stars: number;
    comments?: string | null;
    hadIssues: boolean;
    issueCategory?: string | null;
    issueDetails?: string | null;
}
  