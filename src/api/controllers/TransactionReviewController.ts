import { Body, Delete, Get, JsonController, Params, Post, QueryParam } from 'routing-controllers';
import { CreateTransactionReviewRequest } from '../../types';
import { TransactionReviewModel } from '../../models/TransactionReviewModel';
import { TransactionReviewService } from '../../services/TransactionReviewService';
import { UuidParam } from '../validators/GenericRequests';

@JsonController('transactionReview/')
export class TransactionReviewController {
    private transactionReviewService: TransactionReviewService;

    constructor(transactionReviewService: TransactionReviewService) {
        this.transactionReviewService = transactionReviewService;
    }

    @Get()
    async getTransactionReviews(): Promise<{ reviews: TransactionReviewModel[] }> {
        return { reviews: await this.transactionReviewService.getAllTransactionReviews() };
    }

    @Get('id/:id/')
    async getTransactionReviewById(@Params() params: UuidParam): Promise<{ review: TransactionReviewModel }> {
        return { review: await this.transactionReviewService.getTransactionReviewById(params) };
    }

    @Get('transactionId/:transactionId/')
    async getTransactionReviewByTransactionId(@Params() params: UuidParam): Promise<{ review: TransactionReviewModel }> {
        return { review: await this.transactionReviewService.getTransactionReviewByTransactionId(params) };
    }

    @Post()
    async createTransactionReview(@Body() createTransactionReviewRequest: CreateTransactionReviewRequest): Promise<{ review: TransactionReviewModel }> {
        return { review: await this.transactionReviewService.createTransactionReview(createTransactionReviewRequest) };
    }

    @Delete('id/:id/')
    async deleteTransactionReview(@Params() params: UuidParam): Promise<{ review: TransactionReviewModel }> {
        return { review: await this.transactionReviewService.deleteTransactionReviewById(params) };
    }
}
