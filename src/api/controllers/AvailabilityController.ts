import { Body, CurrentUser, Delete, Get, JsonController, Param, Post, Put } from 'routing-controllers';
import { UserModel } from '../../models/UserModel';
import { AvailabilityService } from '../../services/AvailabilityService';
import { 
    CreateAvailabilityRequest, 
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
     * Create availability for the current user
     * POST /availability/
     */
    @Post()
    async createAvailability(
        @CurrentUser() user: UserModel,
        @Body() request: CreateAvailabilityRequest
    ): Promise<GetAvailabilityResponse> {
        const schedule = request.schedule.map(slot => ({
            startDate: new Date(slot.startDate),
            endDate: new Date(slot.endDate)
        }));

        const availability = await this.availabilityService.createAvailability(
            user.firebaseUid,
            schedule
        );

        return {
            availability: this.toResponse(availability)
        };
    }

    /**
     * Get availability for the current user
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
            availability: availability ? this.toResponse(availability) : null
        };
    }

    /**
     * Get availability for a specific user by their userId
     * GET /availability/user/:userId
     */
    @Get('user/:userId')
    async getAvailabilityByUserId(
        @Param('userId') userId: string
    ): Promise<GetAvailabilityResponse> {
        const availability = await this.availabilityService.getAvailabilityByUserId(userId);

        return {
            availability: availability ? this.toResponse(availability) : null
        };
    }

    /**
     * Update availability for the current user
     * PUT /availability/
     */
    @Put()
    async updateAvailability(
        @CurrentUser() user: UserModel,
        @Body() request: UpdateAvailabilityRequest
    ): Promise<GetAvailabilityResponse> {
        const schedule = request.schedule.map(slot => ({
            startDate: new Date(slot.startDate),
            endDate: new Date(slot.endDate)
        }));

        const availability = await this.availabilityService.updateAvailability(
            user.firebaseUid,
            schedule
        );

        return {
            availability: this.toResponse(availability)
        };
    }

    /**
     * Delete availability for the current user
     * DELETE /availability/
     */
    @Delete()
    async deleteAvailability(
        @CurrentUser() user: UserModel
    ): Promise<{ success: boolean }> {
        await this.availabilityService.deleteAvailability(user.firebaseUid);
        return { success: true };
    }

    /**
     * Helper to convert internal type to response type
     */
    private toResponse(availability: any): UserAvailabilityResponse {
        return {
            id: availability.id,
            userId: availability.userId,
            schedule: availability.schedule.map((slot: any) => ({
                startDate: slot.startDate,
                endDate: slot.endDate
            })),
            updatedAt: availability.updatedAt
        };
    }
}
