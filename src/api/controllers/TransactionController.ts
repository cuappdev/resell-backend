import { Body, CurrentUser, Delete, Get, JsonController, Params, Post } from "routing-controllers";

import { TransactionModel } from "../../models/TransactionModel";
import { TransactionService } from "../../services/TransactionService";
import {
  CreateTransactionRequest,
  UpdateTransactionStatusRequest,
} from "../../types/ApiRequests";
import { UuidParam } from "../validators/GenericRequests";

@JsonController("transaction/")
export class TransactionController {
  private transactionService: TransactionService;

  constructor(transactionService: TransactionService) {
    this.transactionService = transactionService;
  }

  @Get()
  async getAllTransactions(): Promise<{ transactions: TransactionModel[] }> {
    return { transactions: await this.transactionService.getAllTransactions() };
  }

  @Get("id/:id/")
  async getTransactionById(
    @Params() params: UuidParam
  ): Promise<{ transaction: TransactionModel }> {
    return { transaction: await this.transactionService.getTransactionById(params) };
  }

  @Get("buyerId/:id/")
  async getTransactionsByBuyerId(
    @Params() params: UuidParam
  ): Promise<{ transactions: TransactionModel[] }> {
    return { transactions: await this.transactionService.getTransactionsByBuyerId(params) };
  }

  @Get("sellerId/:id/")
  async getTransactionsBySellerId(
    @Params() params: UuidParam
  ): Promise<{ transactions: TransactionModel[] }> {
    return { transactions: await this.transactionService.getTransactionsBySellerId(params) };
  }

  @Post()
  async createTransaction(
    @Body() createTransactionRequest: CreateTransactionRequest
  ): Promise<{ transaction: TransactionModel }> {
    return { transaction: await this.transactionService.createTransaction(createTransactionRequest) };
  }

  @Post("complete/id/:id/")
  async completeTransaction(
    @Params() params: UuidParam,
    @Body() updateTransactionStatusRequest: UpdateTransactionStatusRequest
  ): Promise<{ transaction: TransactionModel }> {
    return {
      transaction: await this.transactionService.completeTransaction(params, updateTransactionStatusRequest),
    };
  }

  @Get("postId/:id/")
  async getTransactionByPostId(
    @Params() params: UuidParam
  ): Promise<{ transaction: TransactionModel }> {
    return { transaction: await this.transactionService.getTransactionByPostId(params) };
  }

}
