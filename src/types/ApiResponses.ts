import { FeedbackModel } from 'src/models/FeedbackModel';

import { Uuid } from '.';
import { PostModel } from '../models/PostModel';
import { UserModel } from '../models/UserModel';
import { APIUserSession } from '../types';

// RESPONSE TYPES

export interface ErrorResponse {
    error: string;
    httpCode: number;
}

// USER

export interface PublicProfile {
    id: Uuid,
    username: string,
    netid: string,
    givenName: string,
    familyName: string,
    stars: number,
    numReviews: number,
    photoUrl: string,
    venmoHandle: string,
    bio: string,
    posts: PostModel[],
}

export interface PrivateProfile extends PublicProfile {
    admin: boolean,
    email: string,
    googleId: string,
    feedbacks: FeedbackModel[],
    blockers: UserModel[] | undefined,
    blocking: UserModel[] | undefined,
}

export interface GetUsersResponse {
    users: PrivateProfile[];
}

export interface GetUserResponse {
    user: PrivateProfile | undefined;
}

// POST

export interface Post {
    id: Uuid,
    title: string,
    description: string,
    categories: string[],
    original_price: number,
    altered_price: number,
    images: string[],
    created: Date,
    location: string,
    archive: boolean,
    user: PrivateProfile,
    savers: PrivateProfile[],
    matched: Request[],
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

// FEEDBACK

export interface Feedback {
    id: Uuid,
    description: string,
    images: string[],
    user: PrivateProfile,
}

export interface GetFeedbacksResponse {
    feedbacks: Feedback[];
}

export interface GetFeedbackResponse {
    feedback: Feedback;
}

// SESSIONS

export interface GetSessionsReponse {
    sessions: APIUserSession[];
}

export interface GetSessionReponse {
    session: APIUserSession;
}

export interface LogoutResponse {
    logoutSuccess: boolean;
}

// IMAGES

export interface ImageUrlResponse {
    image: string;
}

// REQUESTS

export interface Request {
    id: Uuid,
    title: string,
    description: string,
    user: PrivateProfile,
    matches: PostModel[],
}

export interface GetRequestsResponse {
    requests: Request[];
}

export interface GetRequestResponse {
    request: Request;
}

// USER REVIEWS

export interface UserReview {
    id: Uuid,
    fulfilled: boolean,
    stars: number,
    comments: string,
    date: Date,
    buyer: PrivateProfile,
    seller: PrivateProfile,
}

export interface GetUserReviewResponse {
    userReview: UserReview;
}

export interface GetUserReviewsResponse {
    userReviews: UserReview[];
}
// NOTIFICATIONS

export interface PushTicketData {
    status: string,
    id: string,
    message: string,
    details: JSON,
}

export interface PushTicketErrorData {
    code: string,
    message: string,
}

export interface PushTicket {
    data: PushTicketData[],
    errors: PushTicketErrorData[],
}

export interface NotifSent {
    status: string,
}
