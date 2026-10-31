import { FastifyRequest, FastifyReply } from 'fastify';
import scheduleService from '../services/schedule.service';
import { sendSuccess, sendError } from '../utils/response.util';

export class ScheduleController {
  async getDailySchedule(
    request: FastifyRequest<{ Querystring: { date?: string } }>,
    reply: FastifyReply
  ) {
    try {
      const schedule = await scheduleService.getDailySchedule(request.query.date);
      return sendSuccess(reply, 'Daily fleet schedule retrieved successfully', schedule);
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to retrieve daily schedule', 500);
    }
  }

  async getWeeklySchedule(
    request: FastifyRequest<{ Querystring: { start_date?: string } }>,
    reply: FastifyReply
  ) {
    try {
      const schedule = await scheduleService.getWeeklySchedule(request.query.start_date);
      return sendSuccess(reply, 'Weekly fleet schedule retrieved successfully', schedule);
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to retrieve weekly schedule', 500);
    }
  }
}

export default new ScheduleController();
