import { Body, CurrentUser, JsonController, Get, Post, Delete, Params} from "routing-controllers";
import { UserModel } from "../../models/UserModel";
import { ReportService } from "../../services/ReportService";
import { ReportPostRequest, ReportProfileRequest, ReportMessageRequest } from "../../types/ApiRequests";
import { GetReportResponse, GetReportsResponse } from "../../types/ApiResponses";
import { ReportModel } from "../../models/ReportModel";
import { report } from "process";
import { UuidParam } from "../validators/GenericRequests";
import { OpenAPI } from "routing-controllers-openapi";

@JsonController("report/")
export class ReportController {
  private reportService: ReportService;

  constructor(reportService: ReportService) {
    this.reportService = reportService;
  }

  @Get("admin/all/")
  @OpenAPI({
    summary: "Get all reports",
    description: "Retrieves all reports",
    responses: {
      "200": { description: "Reports returned successfully" },
    },
  })
  async getAllReports(@CurrentUser() user: UserModel): Promise<GetReportsResponse> {
    return { reports: await this.reportService.getAllReports(user) };
  }

  @Get("admin/post/")
  @OpenAPI({
    summary: "Get all post reports",
    description: "Retrieves all post reports",
    responses: {
      "200": { description: "Post reports returned successfully" },
    },
  })
  async getAllPostReports(@CurrentUser() user: UserModel): Promise<GetReportsResponse> {
    return { reports: await this.reportService.getAllPostReports(user) };
  }

  @Get("admin/profile/")
  @OpenAPI({
    summary: "Get all profile reports",
    description: "Retrieves all profile reports",
    responses: {
      "200": { description: "Profile reports returned successfully" },
    },
  })
  async getAllProfileReports(@CurrentUser() user: UserModel): Promise<GetReportsResponse> {
    return { reports: await this.reportService.getAllProfileReports(user) };
  }

  @Get("admin/message/")
  @OpenAPI({
    summary: "Get all message reports",
    description: "Retrieves all message reports",
    responses: {
      "200": { description: "Message reports returned successfully" },
    },
  })
  async getAllMessageReports(@CurrentUser() user: UserModel): Promise<GetReportsResponse> {
    return { reports: await this.reportService.getAllMessageReports(user) };
  }

  @Get("id/:id/")
  @OpenAPI({
    summary: "Get report by id",
    description: "Retrieves a report by its id",
    responses: {
      "200": { description: "Report returned successfully" },
      "404": { description: "Report not found" },
    },
  })
  async getReportById(@CurrentUser() user: UserModel, @Params() params: UuidParam): Promise<GetReportResponse> {
    return { report: await this.reportService.getReportById(user, params) };
  }

  @Get("reporter/id/:id/")
  @OpenAPI({
    summary: "Get reports by reporter",
    description: "Retrieves all reports by a reporter",
    responses: {
      "200": { description: "Reports returned successfully" },
      "404": { description: "Reports not found" },
    },
  })
  async getReportsByReporter(@CurrentUser() user: UserModel, @Params() params: UuidParam): Promise<GetReportsResponse> {
    return { reports: await this.reportService.getReportsByReporter(user, params) };
  }

  @Post("post/")
  @OpenAPI({
    summary: "Report post",
    description: "Reports a post",
    responses: {
      "200": { description: "Post reported successfully" },
      "404": { description: "Post not found" },
    },
  })
  async reportPost(@Body() reportPostRequest: ReportPostRequest, @CurrentUser() user: UserModel): Promise<ReportModel> {
    return this.reportService.reportPost(user, reportPostRequest);
  }

  @Post("profile/")
  @OpenAPI({
    summary: "Report profile",
    description: "Reports a profile",
    responses: {
      "200": { description: "Profile reported successfully" },
      "404": { description: "Profile not found" },
    },
  })
  async reportProfile(@Body() reportProfileRequest: ReportProfileRequest, @CurrentUser() user: UserModel): Promise<ReportModel> {
    return this.reportService.reportProfile(user,reportProfileRequest);
  }

  @Post("message/")
  @OpenAPI({
    summary: "Report message",
    description: "Reports a message",
    responses: {
      "200": { description: "Message reported successfully" },
      "404": { description: "Message not found" },
    },
  })
  async reportMessage(@Body() reportMessageRequest: ReportMessageRequest, @CurrentUser() user: UserModel): Promise<ReportModel> {
    return this.reportService.reportMessage(user, reportMessageRequest);
  }

  @Post("resolve/reportId/:id/")
  @OpenAPI({
    summary: "Resolve report",
    description: "Resolves a report",
    responses: {
      "200": { description: "Report resolved successfully" },
      "404": { description: "Report not found" },
    },
  })
  async resolveReport(@CurrentUser() user: UserModel,@Params() params: UuidParam): Promise<ReportModel> {
    return this.reportService.resolveReport(user, params);
  }

  @Delete("delete/:id/")
  @OpenAPI({
    summary: "Delete report",
    description: "Deletes a report",
    responses: {
      "200": { description: "Report deleted successfully" },
      "404": { description: "Report not found" },
    },
  })
  async deleteReport(@CurrentUser() user: UserModel, @Params() params: UuidParam): Promise<ReportModel> {
    return this.reportService.deleteReport(user, params);
  }
}
