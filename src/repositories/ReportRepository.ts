import { AbstractRepository, EntityRepository } from "typeorm";
import { ReportModel } from "../models/ReportModel";
import { UserModel } from "../models/UserModel";
import { PostModel } from "../models/PostModel";
import { MessageModel } from "../models/MessageModel";
import { QueryBuilder } from "typeorm";

@EntityRepository(ReportModel)
export class ReportRepository extends AbstractRepository<ReportModel> {
  public async getAllReports(): Promise<ReportModel[]> {
    return this.repository
      .createQueryBuilder("report")
      .leftJoinAndSelect("report.reporter", "reporter")
      .leftJoinAndSelect("report.reported", "reported")
      .leftJoinAndSelect("report.post", "post")
      .leftJoinAndSelect("report.message", "message")
      .getMany();
  }

  public async getAllPostReports(): Promise<ReportModel[]> {
    return this.repository
      .createQueryBuilder("report")
      .leftJoinAndSelect("report.reporter", "reporter")
      .leftJoinAndSelect("report.reported", "reported")
      .leftJoinAndSelect("report.post", "post")
      .leftJoinAndSelect("report.message", "message")
      .where("report.type = :type", { type: "post" })
      .getMany();
  }

  public async getAllProfileReports(): Promise<ReportModel[]> {
    return this.repository
      .createQueryBuilder("report")
      .leftJoinAndSelect("report.reporter", "reporter")
      .leftJoinAndSelect("report.reported", "reported")
      .leftJoinAndSelect("report.post", "post")
      .leftJoinAndSelect("report.message", "message")
      .where("report.type = :type", { type: "profile" })
      .getMany();
  }

  public async getAllMessageReports(): Promise<ReportModel[]> {
    return this.repository
      .createQueryBuilder("report")
      .leftJoinAndSelect("report.reporter", "reporter")
      .leftJoinAndSelect("report.reported", "reported")
      .leftJoinAndSelect("report.post", "post")
      .leftJoinAndSelect("report.message", "message")
      .where("report.type = :type", { type: "message" })
      .getMany();
  }

  public async getReportById(id: string): Promise<ReportModel | undefined> {
    return this.repository
      .createQueryBuilder("report")
      .leftJoinAndSelect("report.reporter", "reporter")
      .leftJoinAndSelect("report.reported", "reported")
      .leftJoinAndSelect("report.post", "post")
      .leftJoinAndSelect("report.message", "message")
      .where("report.id = :id", { id })
      .getOne();
  }

  public async getReportsByReporter(
    reporter: UserModel,
  ): Promise<ReportModel[]> {
    return this.repository
      .createQueryBuilder("report")
      .leftJoinAndSelect("report.reporter", "reporter")
      .leftJoinAndSelect("report.reported", "reported")
      .leftJoinAndSelect("report.post", "post")
      .leftJoinAndSelect("report.message", "message")
      .where("report.reporter = :reporter", { reporter })
      .getMany();
  }

  public async createReport(
    reporter: UserModel,
    reported: UserModel,
    post: PostModel | undefined,
    message: MessageModel | undefined,
    reason: string,
    type: "post" | "profile" | "message",
  ): Promise<ReportModel> {
    const report = new ReportModel();
    report.reporter = reporter;
    report.reported = reported;
    report.post = post;
    report.message = message;
    report.reason = reason;
    report.type = type;
    report.resolved = false;
    return this.repository.save(report);
  }

  public async resolveReport(report: ReportModel): Promise<ReportModel> {
    report.resolved = true;
    return this.repository.save(report);
  }

  public async deleteReport(report: ReportModel): Promise<ReportModel> {
    return await this.repository.remove(report);
  }
}
