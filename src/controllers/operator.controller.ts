import { FastifyRequest, FastifyReply } from 'fastify';
import operatorService from '../services/operator.service';
import fileUploadService from '../services/file-upload.service';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.util';
import { CreateOperatorInput, UpdateOperatorInput, OperatorQueryFilter, OperatorStatus } from '../interface/operator.interface';

export class OperatorController {
  async createOperator(request: FastifyRequest<{ Body: CreateOperatorInput }>, reply: FastifyReply) {
    try {
      const operator = await operatorService.createOperator(request.body);
      return sendSuccess(reply, 'Operator registered successfully', operator, 201);
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to create operator', 400);
    }
  }

  async getAllOperators(request: FastifyRequest<{ Querystring: OperatorQueryFilter }>, reply: FastifyReply) {
    try {
      const page = Number(request.query.page) || 1;
      const limit = Number(request.query.limit) || 10;
      const { operators, total } = await operatorService.getAllOperators(request.query);
      return sendPaginated(reply, 'Operators retrieved successfully', operators, total, page, limit);
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to retrieve operators', 500);
    }
  }

  async getOperatorById(request: FastifyRequest<{ Params: { operator_id: string } }>, reply: FastifyReply) {
    try {
      const operator = await operatorService.getOperatorById(request.params.operator_id);
      return sendSuccess(reply, 'Operator details retrieved successfully', operator);
    } catch (error: any) {
      return sendError(reply, error.message || 'Operator not found', 404);
    }
  }

  async updateOperator(
    request: FastifyRequest<{ Params: { operator_id: string }; Body: UpdateOperatorInput }>,
    reply: FastifyReply
  ) {
    try {
      const operator = await operatorService.updateOperator(request.params.operator_id, request.body);
      return sendSuccess(reply, 'Operator updated successfully', operator);
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to update operator', 400);
    }
  }

  async updateOperatorStatus(
    request: FastifyRequest<{ Params: { operator_id: string }; Body: { status: OperatorStatus } }>,
    reply: FastifyReply
  ) {
    try {
      const operator = await operatorService.updateOperatorStatus(request.params.operator_id, request.body.status);
      return sendSuccess(reply, 'Operator status updated successfully', operator);
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to update operator status', 400);
    }
  }

  async deleteOperator(request: FastifyRequest<{ Params: { operator_id: string } }>, reply: FastifyReply) {
    try {
      const result = await operatorService.deleteOperator(request.params.operator_id);
      return sendSuccess(reply, result.message);
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to delete operator', 400);
    }
  }

  async getAvailableOperators(request: FastifyRequest, reply: FastifyReply) {
    try {
      const operators = await operatorService.getAvailableOperators();
      return sendSuccess(reply, 'Available operators retrieved', operators);
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to retrieve available operators', 500);
    }
  }

  async uploadOperatorDocument(
    request: FastifyRequest<{ Params: { operator_id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const file = await request.file();
      if (!file) {
        return sendError(reply, 'No document file provided', 400);
      }

      const { relativePath } = await fileUploadService.uploadFile(file, 'operators');
      const operator = await operatorService.updateOperator(request.params.operator_id, {
        document_url: relativePath,
      });

      return sendSuccess(reply, 'Operator document uploaded successfully', operator);
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to upload document', 400);
    }
  }
}

export default new OperatorController();
