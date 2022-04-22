import { Uuid } from '.';

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
}

export interface EditProfileRequest {
    photoUrl_base64: string | undefined;
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

// POST

export interface CreatePostRequest {
    title: string;
    description: string;
    price: number;
    images_base64: string[];
    userId: Uuid;
}

export interface getSavedPostsRequest {
    keywords: string;
}