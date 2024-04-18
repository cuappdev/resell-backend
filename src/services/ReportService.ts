import { Service } from "typedi";
import { EntityManager, Not } from "typeorm";
import { InjectManager } from "typeorm-typedi-extensions";
import { UserModel } from "../models/UserModel";
import { PostModel } from "../models/PostModel";
import { MessageModel } from "../models/MessageModel";
import { ReportModel } from "../models/ReportModel";
import { ReportPostRequest, ReportProfileRequest, ReportMessageRequest } from "../types/ApiRequests";
import Repositories, { TransactionsManager } from "../repositories";
import { report } from "process";
import { UuidParam } from "../api/validators/GenericRequests";
import { NotFoundError, ForbiddenError, UnauthorizedError } from "routing-controllers";

@Service()
export class ReportService {
  private transactions: TransactionsManager;

  constructor(@InjectManager() entityManager: EntityManager) {
    this.transactions = new TransactionsManager(entityManager);
  }

  public async getAllReports(user: UserModel): Promise<ReportModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      if (!user.admin) {
        throw new Error("User does not have permission to get all reports");
      }
      return Repositories.report(transactionalEntityManager).getAllReports();
    });
  }

  public async getAllPostReports(user: UserModel): Promise<ReportModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      if (!user.admin) {
        throw new Error("User does not have permission to get all post reports");
      }
      return Repositories.report(transactionalEntityManager).getAllPostReports();
    });
  }

  public async getAllProfileReports(user: UserModel): Promise<ReportModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      if (!user.admin) {
        throw new Error("User does not have permission to get all profile reports");
      }
      return Repositories.report(transactionalEntityManager).getAllProfileReports();
    });
  }

  public async getAllMessageReports(user: UserModel): Promise<ReportModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      if (!user.admin) {
        throw new Error("User does not have permission to get all message reports");
      }
      return Repositories.report(transactionalEntityManager).getAllMessageReports();
    });
  }

  public async getReportById(user: UserModel, params: UuidParam): Promise<ReportModel> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const reportRepository = Repositories.report(transactionalEntityManager);
      const report = await reportRepository.getReportById(params.id);
      if (!report) throw new NotFoundError("Report not found");
      if (!user.admin) throw new UnauthorizedError("User does not have permission to get report by id");
      return report;
    });
  }

  public async getReportsByReporter(user: UserModel, params: UuidParam): Promise<ReportModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      if (!user.admin) throw new UnauthorizedError("User does not have permission to get reports by reporter");
      const reporter = await Repositories.user(transactionalEntityManager).getUserById(params.id);
      if (!reporter) throw new NotFoundError("Reporter not found");
      return Repositories.report(transactionalEntityManager).getReportsByReporter(reporter);
    });
  }

  public async reportPost(reporter: UserModel, reportPostRequest: ReportPostRequest): Promise<ReportModel> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const reportRepository = Repositories.report(transactionalEntityManager);
      const reportedUser = await Repositories.user(transactionalEntityManager).getUserById(reportPostRequest.reported);
      if (!reportedUser) {
        throw new NotFoundError("Reported user not found");
      }
      const reportedPost = await Repositories.post(transactionalEntityManager).getPostById(reportPostRequest.post);
      if (!reportedPost) {
        throw new NotFoundError("Reported post not found");
      }
      if (reportedPost.user.id === reporter.id) {
        throw new ForbiddenError("You cannot report your own post");
      }
      if (reportedPost.user.id != reportedUser.id) {
        throw new ForbiddenError("Reported user does not own the post");
      }
      if (reportPostRequest.reason === "") {
        throw new ForbiddenError("You must have a reason for reporting a post!");
      }
      return reportRepository.createReport(
        reporter,
        reportedUser,
        reportedPost,
        undefined,
        reportPostRequest.reason,
        "post"
      );
    });
  }

  public async reportProfile(reporter: UserModel, reportProfileRequest: ReportProfileRequest): Promise<ReportModel> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const reportedUser = await Repositories.user(transactionalEntityManager).getUserById(reportProfileRequest.reported);
      if (!reportedUser) {
        throw new NotFoundError("Reported user not found");
      }
      if (reportedUser.id === reporter.id) {
        throw new ForbiddenError("You cannot report your own profile");
      }
      if (reportProfileRequest.reason === "") {
        throw new ForbiddenError("You must have a reason for reporting a profile!");
      }
      const reportRepository = Repositories.report(transactionalEntityManager);
      return reportRepository.createReport(
        reporter,
        reportedUser,
        undefined,
        undefined,
        reportProfileRequest.reason,
        "profile"
      );
    });
  }

  public async reportMessage(reporter: UserModel, reportMessageRequest: ReportMessageRequest): Promise<ReportModel> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const reportedUser = await Repositories.user(transactionalEntityManager).getUserById(reportMessageRequest.reported);
      if (!reportedUser) {
        throw new NotFoundError("Reported user not found");
      }
      const message = reportMessageRequest.message
      if (reportMessageRequest.reason === "") {
        throw new ForbiddenError("You must have a reason for reporting a message!");
      }
      const reportRepository = Repositories.report(transactionalEntityManager);
      return reportRepository.createReport(
        reporter,
        reportedUser,
        undefined,
        message,
        reportMessageRequest.reason,
        "message"
      );
    });
  }

  public async resolveReport(user: UserModel, params: UuidParam): Promise<ReportModel> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const report = await Repositories.report(transactionalEntityManager).getReportById(params.id);
      if (!report) {
        throw new NotFoundError("Report not found");
      }
      if (!user.admin) {
        throw new UnauthorizedError("User does not have permission to resolve reports");
      }
      return Repositories.report(transactionalEntityManager).resolveReport(report);
    });
  }

  public async deleteReport(user: UserModel, params: UuidParam): Promise<ReportModel> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const report = await Repositories.report(transactionalEntityManager).getReportById(params.id);
      if (!report) {
        throw new NotFoundError("Report not found");
      }
      if (!user.admin && report.reporter.id !== user.id) {
        throw new ForbiddenError("User does not have permission to delete reports");
      }
      return Repositories.report(transactionalEntityManager).deleteReport(report);
    });
  }
}
