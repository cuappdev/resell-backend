import { AbstractRepository, EntityRepository } from "typeorm";
import { ReportModel } from "../models/ReportModel";
import { UserModel } from "../models/UserModel";
import { PostModel } from "../models/PostModel";
import { MessageModel } from "../models/MessageModel";

@EntityRepository(ReportModel)
export class ReportRepository extends AbstractRepository<ReportModel> {
  public async getAllReports(): Promise<ReportModel[]> {
    return this.repository.find();
  }

  public async getAllPostReports(): Promise<ReportModel[]> {
    return this.repository.find({ where: { type: "post" } });
  }

  public async getAllProfileReports(): Promise<ReportModel[]> {
    return this.repository.find({ where: { type: "profile" } });
  }

  public async getAllMessageReports(): Promise<ReportModel[]> {
    return this.repository.find({ where: { type: "message" } });
  }

  public async getReportById(id: string): Promise<ReportModel | undefined> {
    return this.repository.findOne(id);
  }

  public async getReportsByReporter(reporter: UserModel): Promise<ReportModel[]> {
    return this.repository.find({ where: { reporter } });
  }
  
  public async createReport(
    reporter: UserModel,
    reported: UserModel,
    post: PostModel | undefined,
    message: MessageModel | undefined,
    reason: string,
    type: "post" | "profile" | "message"
  ): Promise<ReportModel> {
    const report = new ReportModel();
    report.reporter = reporter;
    report.reported = reported;
    report.post = post;
    report.message = message;
    report.reason = reason;
    report.type = type;
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
