import { OAuth2Client } from 'google-auth-library';
import { NotFoundError, UnauthorizedError } from 'routing-controllers';
import { Service } from 'typedi';
import { EntityManager } from 'typeorm';
import { InjectManager } from 'typeorm-typedi-extensions';

import { UserModel } from '../models/UserModel';
import { UserSessionModel } from '../models/UserSessionModel';
import Repositories, { TransactionsManager } from '../repositories';
import { APIUserSession, AuthRequest, CreateUserRequest, Uuid } from '../types';

const client = new OAuth2Client(process.env.OAUTH_BACKEND_ID);

@Service()
export class AuthService {
  private transactions: TransactionsManager;

  constructor(@InjectManager() entityManager: EntityManager) {
    this.transactions = new TransactionsManager(entityManager);
  }

  public async loginUser(authRequest: AuthRequest): Promise<UserSessionModel | undefined> {
    // checks if the email is a Cornell email
    const emailIndex = authRequest.user.email.indexOf('@cornell.edu')
    if (emailIndex === -1) {
      throw new UnauthorizedError('Non-Cornell email used!');
    } 

    if (process.env.OAUTH_ANDROID_CLIENT && process.env.OAUTH_IOS_ID) {
      // verifies info using id token
      const ticket = await client.verifyIdToken({
        idToken: authRequest.idToken,
      });
    
      const payload = ticket.getPayload();

      if (payload){
        // token checking in payload
        if (payload.iss !== 'accounts.google.com' && payload.iss !== 'https://accounts.google.com') {
          throw new UnauthorizedError('Invalid token (issuer)');
        }

        // gets Google ID and checks if the user is already in the database
        const userId = payload.sub;
        const newUser = authRequest.user;
        return this.transactions.readWrite(async (transactionalEntityManager) => {
          const userRepository = Repositories.user(transactionalEntityManager);
          let user = await userRepository.getUserByGoogleId(userId);
          const sessionsRepository = Repositories.session(transactionalEntityManager);
          if (!user) {
            // if the user is not in the database, create a new user
            // extracts everything before @cornell.edu in variable "netid"
            const netid = authRequest.user.email.substring(0, emailIndex);
            user = await userRepository.createUser(netid, netid, newUser.givenName, newUser.familyName,
              newUser.photoUrl, newUser.email, userId);
          }
          // since they're logging in, create a new session for them
          const session = sessionsRepository.createSession(user);
          return session;
        });
      }
      return undefined;
    } else {
      throw new Error('env variables not set');
    }
  }

  public async createUser(createUserRequest: CreateUserRequest): Promise<UserModel> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const userRepository = Repositories.user(transactionalEntityManager);
      return userRepository.createUser(createUserRequest.username, createUserRequest.netid, 
        createUserRequest.givenName, createUserRequest.familyName, createUserRequest.photoUrl,
        createUserRequest.email, createUserRequest.googleId);
    });
  }

  public async deleteUserById(id: Uuid): Promise<UserModel> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const userRepository = Repositories.user(transactionalEntityManager);
      const user = await userRepository.getUserById(id);
      if (!user) throw new NotFoundError('User not found!');
      return userRepository.deleteUser(user);
    });
  }

  public async getSessionsByUserId(id: Uuid): Promise<APIUserSession[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const sessionRepository = Repositories.session(transactionalEntityManager);
      const sessions = await sessionRepository.getSessionsByUserId(id);
      if (!sessions) throw new NotFoundError('User not found!');
      const apiSessions: APIUserSession[] = [];
      sessions.forEach(function (session) {
        apiSessions.push(session.serializeToken());
      });
      return apiSessions;
    });
  }

  public async deleteSessionByAccessToken(accessToken: string): Promise<boolean> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const sessionRepository = Repositories.session(transactionalEntityManager);
      const success = await sessionRepository.deleteSessionByAccessToken(accessToken);
      return success;
    });
  }
}