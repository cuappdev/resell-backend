import { UserModel } from "../models/UserModel";
import { PostModel } from "../models/PostModel";
import { MessageModel } from "../models/MessageModel";

export interface ReportPostRequest {
  reported: UserModel;
  post: PostModel;
  reason: string;
}

export interface ReportProfileRequest {
  reported: UserModel;
  reason: string;
}

export interface ReportMessageRequest {
  reported: UserModel;
  message: MessageModel;
  reason: string;
}
