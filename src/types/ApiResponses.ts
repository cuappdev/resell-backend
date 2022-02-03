import { Uuid } from '.';

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

// USER

export interface PublicProfile {
    id: Uuid,
    name: string,
    profilePictureUrl: string,
    bio: string,
}

export interface PrivateProfile extends PublicProfile {
    email: string,
    googleId: string,
}

export interface GetAllUsersResponse extends ApiResponse {
    users: PrivateProfile[];
}

export interface GetUserResponse extends ApiResponse {
    user: PrivateProfile;
}