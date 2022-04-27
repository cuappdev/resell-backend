import { OAuth2Client } from 'google-auth-library';
import { NotFoundError } from 'routing-controllers';
import { UuidParam } from 'src/api/validators/GenericRequests';
import { Service } from 'typedi';
import { EntityManager } from 'typeorm';
import { InjectManager } from 'typeorm-typedi-extensions';

import { UserModel } from '../models/UserModel';
import { UserSessionModel } from '../models/UserSessionModel';
import Repositories, { TransactionsManager } from '../repositories';
import { APIUserSession, AuthRequest, Uuid } from '../types';

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
      throw new Error('Non-Cornell email used!');
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
          throw new Error('Invalid token (issuer)');
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

  public async deleteUserById(params: UuidParam): Promise<UserModel> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const userRepository = Repositories.user(transactionalEntityManager);
      const user = await userRepository.getUserById(params.id);
      if (!user) throw new NotFoundError('User not found!');
      return await userRepository.deleteUser(user);
    });
  }

  public async getSessionsByUserId(params: UuidParam): Promise<APIUserSession[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const sessionRepository = Repositories.session(transactionalEntityManager);
      const sessions = await sessionRepository.getSessionsByUserId(params.id);
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
      return await sessionRepository.deleteSessionByAccessToken(accessToken);
    });
  }
}