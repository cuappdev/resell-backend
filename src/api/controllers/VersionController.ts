import { Get, JsonController } from "routing-controllers";

import { AppVersionService } from "../../services/AppVersionService";

@JsonController("version/")
export class VersionController {
  private appVersionService: AppVersionService;

  constructor(appVersionService: AppVersionService) {
    this.appVersionService = appVersionService;
  }

  @Get()
  async get(): Promise<{ version: string }> {
    const version = await this.appVersionService.fetchIosAppStoreVersion();
    return { version };
  }
}

