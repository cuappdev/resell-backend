import { Uuid } from '.';

// REQUEST TYPES

// AUTH

export interface CreateUserRequest {
    firstName: string;
    lastName: string;
    profilePictureUrl: string;
    venmoHandle: string;
    email: string;
    googleId: string;
    bio: string;
}

// USER

export interface GetUserByEmailRequest {
    email: string;
}

// POST

export interface CreatePostRequest {
    title: string;
    description: string;
    categories: string[];
    price: number;
    images: string[];
    userId: Uuid;
}

export interface getSavedPostsRequest {
    keywords: string;
}

export interface filterPostsRequest {
    category: string;
}