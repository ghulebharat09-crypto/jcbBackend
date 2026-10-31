import { FastifyRequest, FastifyReply } from 'fastify';
import dashboardService from '../services/dashboard.service';
import { sendSuccess, sendError } from '../utils/response.util';

export class DashboardController {
  async getSummary(request: FastifyRequest, reply: FastifyReply) {
    try {
      const summary = await dashboardService.getSummary();
      return sendSuccess(reply, 'Dashboard summary retrieved successfully', summary);
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to retrieve dashboard summary', 500);
    }
  }

  async getRecentBookings(
    request: FastifyRequest<{ Querystring: { limit?: number } }>,
    reply: FastifyReply
  ) {
    try {
      const limit = Number(request.query.limit) || 5;
      const recent = await dashboardService.getRecentBookings(limit);
      return sendSuccess(reply, 'Recent bookings retrieved successfully', recent);
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to retrieve recent bookings', 500);
    }
  }
}

export default new DashboardController();
