import { Service } from "typedi";
import { EntityManager } from "typeorm";
import { InjectManager } from "typeorm-typedi-extensions";
import { UserModel } from "../models/UserModel";
import { PostModel } from "../models/PostModel";
import { MessageModel } from "../models/MessageModel";
import { ReportModel } from "../models/ReportModel";
import Repositories, { TransactionsManager } from "../repositories";

@Service()
export class ReportService {
  private transactions: TransactionsManager;

  constructor(@InjectManager() entityManager: EntityManager) {
    this.transactions = new TransactionsManager(entityManager);
  }

  public async reportPost(
    reporter: UserModel,
    reported: UserModel,
    post: PostModel,
    reason: string
  ): Promise<ReportModel> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const reportRepository = Repositories.report(transactionalEntityManager);
      return reportRepository.createReport(
        reporter,
        reported,
        post,
        undefined,
        reason,
        "post"
      );
    });
  }

  public async reportProfile(
    reporter: UserModel,
    reported: UserModel,
    reason: string
  ): Promise<ReportModel> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const reportRepository = Repositories.report(transactionalEntityManager);
      return reportRepository.createReport(
        reporter,
        reported,
        undefined,
        undefined,
        reason,
        "profile"
      );
    });
  }

  public async reportMessage(
    reporter: UserModel,
    reported: UserModel,
    message: MessageModel,
    reason: string
  ): Promise<ReportModel> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const reportRepository = Repositories.report(transactionalEntityManager);
      return reportRepository.createReport(
        reporter,
        reported,
        undefined,
        message,
        reason,
        "message"
      );
    });
  }
}
