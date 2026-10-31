import { FastifyRequest, FastifyReply } from 'fastify';
import machineService from '../services/machine.service';
import fileUploadService from '../services/file-upload.service';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.util';
import { CreateMachineInput, UpdateMachineInput, MachineQueryFilter, MachineStatus } from '../interface/machine.interface';

export class MachineController {
  async createMachine(request: FastifyRequest<{ Body: CreateMachineInput }>, reply: FastifyReply) {
    try {
      const machine = await machineService.createMachine(request.body);
      return sendSuccess(reply, 'Machine registered successfully', machine, 201);
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to create machine', 400);
    }
  }

  async getAllMachines(request: FastifyRequest<{ Querystring: MachineQueryFilter }>, reply: FastifyReply) {
    try {
      const page = Number(request.query.page) || 1;
      const limit = Number(request.query.limit) || 10;
      const { machines, total } = await machineService.getAllMachines(request.query);
      return sendPaginated(reply, 'Machines retrieved successfully', machines, total, page, limit);
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to retrieve machines', 500);
    }
  }

  async getMachineById(request: FastifyRequest<{ Params: { machine_id: string } }>, reply: FastifyReply) {
    try {
      const machine = await machineService.getMachineById(request.params.machine_id);
      return sendSuccess(reply, 'Machine details retrieved successfully', machine);
    } catch (error: any) {
      return sendError(reply, error.message || 'Machine not found', 404);
    }
  }

  async updateMachine(
    request: FastifyRequest<{ Params: { machine_id: string }; Body: UpdateMachineInput }>,
    reply: FastifyReply
  ) {
    try {
      const machine = await machineService.updateMachine(request.params.machine_id, request.body);
      return sendSuccess(reply, 'Machine updated successfully', machine);
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to update machine', 400);
    }
  }

  async updateMachineStatus(
    request: FastifyRequest<{ Params: { machine_id: string }; Body: { status: MachineStatus } }>,
    reply: FastifyReply
  ) {
    try {
      const machine = await machineService.updateMachineStatus(request.params.machine_id, request.body.status);
      return sendSuccess(reply, 'Machine status updated successfully', machine);
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to update machine status', 400);
    }
  }

  async deleteMachine(request: FastifyRequest<{ Params: { machine_id: string } }>, reply: FastifyReply) {
    try {
      const result = await machineService.deleteMachine(request.params.machine_id);
      return sendSuccess(reply, result.message);
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to delete machine', 400);
    }
  }

  async checkAvailability(
    request: FastifyRequest<{ Querystring: { start_date: string; end_date: string; machine_id?: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { start_date, end_date, machine_id } = request.query;
      if (!start_date || !end_date) {
        return sendError(reply, 'start_date and end_date query parameters are required', 400);
      }
      const available = await machineService.checkAvailability(start_date, end_date, machine_id);
      return sendSuccess(reply, 'Available machines retrieved', available);
    } catch (error: any) {
      return sendError(reply, error.message || 'Availability check failed', 500);
    }
  }

  async uploadMachineImage(
    request: FastifyRequest<{ Params: { machine_id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const file = await request.file();
      if (!file) {
        return sendError(reply, 'No image file provided', 400);
      }

      const { relativePath } = await fileUploadService.uploadFile(file, 'machines');
      const machine = await machineService.updateMachine(request.params.machine_id, {
        image_url: relativePath,
      });

      return sendSuccess(reply, 'Machine photo uploaded successfully', machine);
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to upload photo', 400);
    }
  }
}

export default new MachineController();
