// ReportFactory.ts
import { define } from "typeorm-seeding";
import { ReportModel } from "../models/ReportModel";
import { UserModel } from "../models/UserModel";
import { PostModel } from "../models/PostModel";
import { MessageModel } from "../models/MessageModel";

// Define a factory for ReportModel
define(
  ReportModel,
  (
    _,
    context?: {
      index?: number;
      reporter?: UserModel;
      reported?: UserModel;
      post?: PostModel;
      message?: MessageModel;
    },
  ) => {
    if (
      context === undefined ||
      context.reporter === undefined ||
      context.reported === undefined ||
      context.index === undefined ||
      context.post === undefined ||
      context.message === undefined
    )
      throw "Context, reporter, and reported cannot be undefined";

    const report = new ReportModel();
    const index = context.index;

    report.reporter = context.reporter;
    report.reported = context.reported;
    report.post = context.post ?? null;
    report.message = context.message ?? null;

    // Use consistent data for report fields, utilizing index for uniqueness
    report.reason = `This is a report reason ${index}`;
    report.type =
      index % 3 === 0 ? "message" : index % 2 === 0 ? "profile" : "post";
    report.resolved = index % 2 === 0;
    report.created = new Date("2023-01-01T00:00:00Z");

    return report;
  },
);
