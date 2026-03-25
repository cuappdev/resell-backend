import {
  CurrentUser,
  Get,
  JsonController,
  Param,
  QueryParam,
} from "routing-controllers";

import { UserModel } from "../../models/UserModel";
import { EventTagModel } from "../../models/EventTagModel";
import { EventService } from "../../services/EventService";
import { EventPostSource, GetEventPostsResponse } from "../../types";

@JsonController("event/")
export class EventController {
  private eventService: EventService;

  constructor(eventService: EventService) {
    this.eventService = eventService;
  }

  @Get("available-for-tagging/")
  async getAvailableEventTags(
    @CurrentUser() user: UserModel,
  ): Promise<EventTagModel[]> {
    return this.eventService.getAvailableEventTags();
  }

  @Get(":eventTagId/posts/")
  async getEventPosts(
    @CurrentUser() user: UserModel,
    @Param("eventTagId") eventTagId: string,
    @QueryParam("page", { required: false }) page: number = 1,
    @QueryParam("limit", { required: false }) limit: number = 10,
    @QueryParam("source", { required: false }) source?: EventPostSource,
  ): Promise<GetEventPostsResponse> {
    return this.eventService.getEventPosts(user, eventTagId, page, limit, source);
  }
}
