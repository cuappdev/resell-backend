import { Uuid } from '.';

// REQUEST TYPES

// USER

export interface CreateUserRequest {
    firstName: string;
    lastName: string;
    profilePictureUrl: string;
    venmoHandle: string;
    email: string;
    googleId: string;
    bio: string;
}

export interface GetUserByEmailRequest {
    email: string;
}

// POST

export interface CreatePostRequest {
    title: string;
    description: string;
    price: number;
    images: string[];
    userId: Uuid;
}