import { Uuid } from '.';
import { MessageModel } from '../models/MessageModel';

// REQUEST TYPES

// AUTH

export interface FcmTokenRequest {
    token: string;
}

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
    deviceToken: string; // This now the fcmToken, I'm choosing to keep the name to avoid confusion.
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
    fcmToken: string;
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
    category: string;
    condition: string;
    original_price: number;
    imagesBase64: string[];
    userId: string;
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
    userId: string;
}

export interface GetSearchedFeedbackRequest {
    keywords: string;
}

export interface FilterPostsRequest {
    categories: string[];
}

export interface FilterPostsByPriceRequest {
    lowerBound: number;
    upperBound: number;
}

export interface FilterPostsByConditionRequest {
    condition: string[];
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
    userId: string;
}

// USER REVIEW

export interface CreateUserReviewRequest {
    fulfilled: boolean,
    stars: number,
    comments: string,
    buyerId: string,
    sellerId: string,
}
// NOTIFICATION
export interface NotificationData {
    to: string[];
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

export interface DiscountNotificationRequest {
    listingId: Uuid;
    oldPrice: number;
    newPrice: number;
    sellerId: Uuid;
}

export interface RequestMatchNotificationRequest {
    requestId: Uuid;
    listingId: Uuid;
    userId: Uuid;
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
}

export interface CreateChatMessage {
    type: string;
    listingId: Uuid;
    buyerId: Uuid;
    sellerId: Uuid;
    senderId: Uuid;
    text: string;
    images:string[]
}

export interface CreateAvailabilityChat {
    type: string;
    listingId: Uuid;
    buyerId: Uuid;
    sellerId: Uuid;
    senderId: Uuid,
    availabilities:AvailabilityList[] //TODO: not sure if this works
}

export interface AvailabilityList {
    startDate: Date;
    endDate: Date;
}
  
export interface CreateProposalChat {
    type: string;
    listingId: Uuid;
    buyerId: Uuid;
    sellerId: Uuid;
    senderId: Uuid,
    startDate: Date;
    endDate: Date;
}

export interface RespondProposalChat {
    type: string;
    listingId: Uuid;
    buyerId: Uuid;
    sellerId: Uuid;
    senderId: Uuid,
    startDate: Date;
    endDate: Date;
    accepted: boolean
}
  