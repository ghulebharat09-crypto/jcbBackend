import { FastifyRequest, FastifyReply } from 'fastify';
import maintenanceService from '../services/maintenance.service';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.util';
import { CreateMaintenanceInput, UpdateMaintenanceInput, MaintenanceQueryFilter } from '../interface/maintenance.interface';

export class MaintenanceController {
  async createMaintenance(request: FastifyRequest<{ Body: CreateMaintenanceInput }>, reply: FastifyReply) {
    try {
      const record = await maintenanceService.createMaintenance(request.body);
      return sendSuccess(reply, 'Maintenance record logged successfully', record, 201);
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to log maintenance', 400);
    }
  }

  async getAllMaintenance(request: FastifyRequest<{ Querystring: MaintenanceQueryFilter }>, reply: FastifyReply) {
    try {
      const page = Number(request.query.page) || 1;
      const limit = Number(request.query.limit) || 10;
      const { records, total } = await maintenanceService.getAllMaintenance(request.query);
      return sendPaginated(reply, 'Maintenance records retrieved successfully', records, total, page, limit);
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to retrieve maintenance records', 500);
    }
  }

  async getMaintenanceById(request: FastifyRequest<{ Params: { maintenance_id: string } }>, reply: FastifyReply) {
    try {
      const record = await maintenanceService.getMaintenanceById(request.params.maintenance_id);
      return sendSuccess(reply, 'Maintenance record details retrieved successfully', record);
    } catch (error: any) {
      return sendError(reply, error.message || 'Maintenance record not found', 404);
    }
  }

  async updateMaintenance(
    request: FastifyRequest<{ Params: { maintenance_id: string }; Body: UpdateMaintenanceInput }>,
    reply: FastifyReply
  ) {
    try {
      const record = await maintenanceService.updateMaintenance(request.params.maintenance_id, request.body);
      return sendSuccess(reply, 'Maintenance record updated successfully', record);
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to update maintenance record', 400);
    }
  }

  async deleteMaintenance(request: FastifyRequest<{ Params: { maintenance_id: string } }>, reply: FastifyReply) {
    try {
      const result = await maintenanceService.deleteMaintenance(request.params.maintenance_id);
      return sendSuccess(reply, result.message);
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to delete maintenance record', 400);
    }
  }

  async getExpensesSummary(request: FastifyRequest, reply: FastifyReply) {
    try {
      const summary = await maintenanceService.getExpensesSummary();
      return sendSuccess(reply, 'Maintenance expense summary retrieved', summary);
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to retrieve expense summary', 500);
    }
  }
}

export default new MaintenanceController();
