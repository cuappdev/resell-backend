import { IsEmail, IsUUID } from 'class-validator';

import { Uuid } from '../../types';

export class EmailParam {
  @IsEmail()
  email: string;
}

export class UuidParam {
  @IsUUID()
  id: Uuid;
}

export class TimeParam {
  @IsUUID()
  id: Uuid;
  time: Date | undefined
}

export class FirebaseUidParam {
  id: string;
}