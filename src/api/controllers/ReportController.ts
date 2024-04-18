import { Body, CurrentUser, JsonController, Get, Post, Delete, Params} from "routing-controllers";
import { UserModel } from "../../models/UserModel";
import { ReportService } from "../../services/ReportService";
import { ReportPostRequest, ReportProfileRequest, ReportMessageRequest } from "../../types/ApiRequests";
import { GetReportResponse, GetReportsResponse } from "../../types/ApiResponses";
import { ReportModel } from "../../models/ReportModel";
import { report } from "process";
import { UuidParam } from "../validators/GenericRequests";

@JsonController("report/")
export class ReportController {
  private reportService: ReportService;

  constructor(reportService: ReportService) {
    this.reportService = reportService;
  }

  @Get("admin/all/")
  async getAllReports(@CurrentUser() user: UserModel): Promise<GetReportsResponse> {
    return { reports: await this.reportService.getAllReports(user) };
  }

  @Get("admin/post/")
  async getAllPostReports(@CurrentUser() user: UserModel): Promise<GetReportsResponse> {
    return { reports: await this.reportService.getAllPostReports(user) };
  }

  @Get("admin/profile/")
  async getAllProfileReports(@CurrentUser() user: UserModel): Promise<GetReportsResponse> {
    return { reports: await this.reportService.getAllProfileReports(user) };
  }

  @Get("admin/message/")
  async getAllMessageReports(@CurrentUser() user: UserModel): Promise<GetReportsResponse> {
    return { reports: await this.reportService.getAllMessageReports(user) };
  }

  @Get("id/:id/")
  async getReportById(@CurrentUser() user: UserModel, @Params() params: UuidParam): Promise<GetReportResponse> {
    return { report: await this.reportService.getReportById(user, params) };
  }

  @Get("reporter/id/:id/")
  async getReportsByReporter(@CurrentUser() user: UserModel, @Params() params: UuidParam): Promise<GetReportsResponse> {
    return { reports: await this.reportService.getReportsByReporter(user, params) };
  }

  @Post("post/")
  async reportPost(@Body() reportPostRequest: ReportPostRequest, @CurrentUser() user: UserModel): Promise<ReportModel> {
    return this.reportService.reportPost(user, reportPostRequest);
  }

  @Post("profile/")
  async reportProfile(@Body() reportProfileRequest: ReportProfileRequest, @CurrentUser() user: UserModel): Promise<ReportModel> {
    return this.reportService.reportProfile(user,reportProfileRequest);
  }

  @Post("message/")
  async reportMessage(@Body() reportMessageRequest: ReportMessageRequest, @CurrentUser() user: UserModel): Promise<ReportModel> {
    return this.reportService.reportMessage(user, reportMessageRequest);
  }

  @Post("resolve/reportId/:id/")
  async resolveReport(@CurrentUser() user: UserModel,@Params() params: UuidParam): Promise<ReportModel> {
    return this.reportService.resolveReport(user, params);
  }

  @Delete("delete/:id/")
  async deleteReport(@CurrentUser() user: UserModel, @Params() params: UuidParam): Promise<ReportModel> {
    return this.reportService.deleteReport(user, params);
  }
}
