import { Uuid } from '.';
import { PostModel } from '../models/PostModel';

// API response types

export interface CustomErrorBody {
    name: string;
    message: string;
    httpCode: number;
    stack?: string;
    errors?: any;
}

export interface ApiResponse {
    error: CustomErrorBody | null;
}

export interface GenericSuccessResponse extends ApiResponse {
    success: boolean;
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

export interface GetUsersResponse extends ApiResponse {
    users: PrivateProfile[];
}

export interface GetUserResponse extends ApiResponse {
    user: PrivateProfile | null;
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

export interface GetPostsResponse extends ApiResponse {
    posts: Post[];
}

export interface GetPostResponse extends ApiResponse {
    post: Post;
}