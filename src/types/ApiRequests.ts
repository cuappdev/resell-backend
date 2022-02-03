import { Uuid } from '.';

// REQUEST TYPES

export interface PostUserRequest {
    name: string;
    profilePictureUrl: string;
    bio: string;
    email: string;
    googleId: string;
}