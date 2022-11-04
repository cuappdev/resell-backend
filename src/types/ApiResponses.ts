import { FeedbackModel } from 'src/models/FeedbackModel';

import { Uuid } from '.';
import { PostModel } from '../models/PostModel';
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
    photoUrl: string,
    venmoHandle: string,
    bio: string,
    posts: PostModel[],
}

export interface PrivateProfile extends PublicProfile {
    admin: boolean,
    email: string,
    googleId: string,
    saved: PostModel[],
    feedback: FeedbackModel[],
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
    price: number,
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

// FEEDBACK

export interface Feedback {
    id: Uuid,
    description: string,
    images: string[],
    user: PrivateProfile,
}

export interface GetFeedbacksResponse {
    feedback: Feedback[];
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