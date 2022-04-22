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
    photoUrl: string,
    venmoHandle: string,
    bio: string,
    posts: PostModel[],
}

export interface PrivateProfile extends PublicProfile {
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
    location: string,
    user: PrivateProfile,
}

export interface GetPostsResponse {
    posts: Post[];
}

export interface GetPostResponse {
    post: Post;
}

// FEEDBACK

export interface Feedback {
    id: Uuid,
    description: string,
    images: string[],
    user: PublicProfile,
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

export interface LogoutResponse {
    logoutSuccess: boolean;
}