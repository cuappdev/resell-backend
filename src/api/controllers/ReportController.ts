import { Body, CurrentUser, JsonController, Post } from "routing-controllers";
import { UserModel } from "../../models/UserModel";
import { ReportService } from "../../services/ReportService";
import {
  ReportPostRequest,
  ReportProfileRequest,
  ReportMessageRequest,
} from "../../types/ReportRequests";
import { ReportModel } from "../../models/ReportModel";

@JsonController("report/")
export class ReportController {
  private reportService: ReportService;

  constructor(reportService: ReportService) {
    this.reportService = reportService;
  }

  @Post("post/")
  async reportPost(
    @Body() reportPostRequest: ReportPostRequest,
    @CurrentUser() user: UserModel
  ): Promise<ReportModel> {
    return this.reportService.reportPost(
      user,
      reportPostRequest.reported,
      reportPostRequest.post,
      reportPostRequest.reason
    );
  }

  @Post("profile/")
  async reportProfile(
    @Body() reportProfileRequest: ReportProfileRequest,
    @CurrentUser() user: UserModel
  ): Promise<ReportModel> {
    return this.reportService.reportProfile(
      user,
      reportProfileRequest.reported,
      reportProfileRequest.reason
    );
  }

  @Post("message/")
  async reportMessage(
    @Body() reportMessageRequest: ReportMessageRequest,
    @CurrentUser() user: UserModel
  ): Promise<ReportModel> {
    return this.reportService.reportMessage(
      user,
      reportMessageRequest.reported,
      reportMessageRequest.message,
      reportMessageRequest.reason
    );
  }
}
