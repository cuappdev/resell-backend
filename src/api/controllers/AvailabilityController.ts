import { Body, CurrentUser, Get, JsonController, Param, Post } from 'routing-controllers';
import { UserModel } from '../../models/UserModel';
import { AvailabilityService } from '../../services/AvailabilityService';
import {
    UpdateAvailabilityRequest,
    GetAvailabilityResponse,
    UserAvailabilityResponse
} from '../../types';

@JsonController('availability/')
export class AvailabilityController {
    private availabilityService: AvailabilityService;

    constructor(availabilityService: AvailabilityService) {
        this.availabilityService = availabilityService;
    }

    /**
     * Get availability for the current user
     * Creates empty availability if user doesn't have one yet
     * GET /availability/
     */
    @Get()
    async getMyAvailability(
        @CurrentUser() user: UserModel
    ): Promise<GetAvailabilityResponse> {
        const availability = await this.availabilityService.getAvailabilityByUserId(
            user.firebaseUid
        );

        return {
            availability: this.toResponse(availability)
        };
    }

    /**
     * Get availability for a specific user by their userId
     * Creates empty availability if user doesn't have one yet
     * GET /availability/user/:userId
     */
    @Get('user/:userId')
    async getAvailabilityByUserId(
        @Param('userId') userId: string
    ): Promise<GetAvailabilityResponse> {
        const availability = await this.availabilityService.getAvailabilityByUserId(userId);

        return {
            availability: this.toResponse(availability)
        };
    }

    /**
     * Update availability for specific days
     * Only the days included in the request are updated - other days remain unchanged
     * Send an empty array for a day to clear that day's availability
     * 
     * POST /availability/update/
     * 
     * Example request body:
     * {
     *   "schedule": {
     *     "2026-01-23": [
     *       { "startDate": "2026-01-23T16:00:00Z", "endDate": "2026-01-23T18:00:00Z" }
     *     ],
     *     "2026-01-24": []  // clears this day
     *   }
     * }
     */
    @Post('update/')
    async updateAvailability(
        @CurrentUser() user: UserModel,
        @Body() request: UpdateAvailabilityRequest
    ): Promise<GetAvailabilityResponse> {
        // Convert string dates to Date objects for each day
        const scheduleUpdates: Record<string, { startDate: Date; endDate: Date }[]> = {};

        for (const [day, slots] of Object.entries(request.schedule)) {
            scheduleUpdates[day] = slots.map(slot => ({
                startDate: new Date(slot.startDate),
                endDate: new Date(slot.endDate)
            }));
        }

        const availability = await this.availabilityService.updateAvailability(
            user.firebaseUid,
            scheduleUpdates
        );

        return {
            availability: this.toResponse(availability)
        };
    }

    /**
     * Helper to convert internal type to response type
     */
    private toResponse(availability: any): UserAvailabilityResponse {
        // Convert schedule to response format
        const scheduleResponse: Record<string, { startDate: Date; endDate: Date }[]> = {};

        for (const [day, slots] of Object.entries(availability.schedule)) {
            scheduleResponse[day] = (slots as any[]).map((slot: any) => ({
                startDate: slot.startDate,
                endDate: slot.endDate
            }));
        }

        return {
            id: availability.id,
            userId: availability.userId,
            schedule: scheduleResponse,
            updatedAt: availability.updatedAt
        };
    }
}
