import { AbstractRepository, EntityRepository } from "typeorm";
import { ReportModel } from "../models/ReportModel";
import { UserModel } from "../models/UserModel";
import { PostModel } from "../models/PostModel";
import { MessageModel } from "../models/MessageModel";

@EntityRepository(ReportModel)
export class ReportRepository extends AbstractRepository<ReportModel> {
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
}
