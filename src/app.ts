import dotenv from 'dotenv';
dotenv.config();

import { verify } from './utils/auth';

verify("invalid token");