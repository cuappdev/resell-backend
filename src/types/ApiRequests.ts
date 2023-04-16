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

// POST

export interface CreatePostRequest {
    title: string;
    description: string;
    categories: string[];
    price: number;
    imagesBase64: string[];
    userId: Uuid;
}

export interface GetSearchedPostsRequest {
    keywords: string;
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
    userId: Uuid;
}