import { IsEmail, IsNumber, IsString, IsUUID } from 'class-validator';

import { Uuid } from '../../types';

export class EmailParam {
  @IsEmail()
  email: string;
}

export class UuidParam {
  @IsUUID()
  id: Uuid;
}

export class ChatParam {
  @IsString()
  id: string;
}

export class ChatReadParam {
  @IsString()
  chatId: string;
  @IsString()
  messageId:string;
}

export class TimeParam {
  @IsUUID()
  id: Uuid;
  time: Date | undefined
}

export class FirebaseUidParam {
  @IsString()
  id: string;
}