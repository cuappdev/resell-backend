import { Uuid } from '.';
import { PostModel } from '../models/PostModel';

// RESPONSE TYPES


export interface ErrorResponse {
    error: string;
}

// ERROR CHECKER

type ErrorWithMessage = {
    message: string
}

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
    return (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as Record<string, unknown>).message === 'string'
    )
}

function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
    if (isErrorWithMessage(maybeError)) return maybeError

    try {
        return new Error(JSON.stringify(maybeError))
    } catch {
        // fallback in case there's an error stringifying the maybeError
        // like with circular references for example.
        return new Error(String(maybeError))
    }
}

export function getErrorMessage(error: unknown): string {  
    return toErrorWithMessage(error).message
}

// USER

export interface PublicProfile {
    id: Uuid,
    firstName: string,
    lastName: string,
    profilePictureUrl: string,
    venmoHandle: string,
    bio: string,
    posts: PostModel[],
}

export interface PrivateProfile extends PublicProfile {
    email: string,
    googleId: string,
    saved: PostModel[],
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
    price: number,
    images: string[],
    location: string,
    user: PublicProfile,
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