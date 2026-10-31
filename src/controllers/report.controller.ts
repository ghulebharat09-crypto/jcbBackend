import { FastifyRequest, FastifyReply } from 'fastify';
import reportService from '../services/report.service';
import { sendSuccess, sendError } from '../utils/response.util';

export class ReportController {
  async getRevenueAnalytics(
    request: FastifyRequest<{ Querystring: { year?: number } }>,
    reply: FastifyReply
  ) {
    try {
      const year = request.query.year ? Number(request.query.year) : undefined;
      const data = await reportService.getRevenueAnalytics(year);
      return sendSuccess(reply, 'Revenue report retrieved successfully', data);
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to retrieve revenue report', 500);
    }
  }

  async getFleetUtilization(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = await reportService.getFleetUtilization();
      return sendSuccess(reply, 'Fleet utilization statistics retrieved successfully', data);
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to retrieve fleet utilization', 500);
    }
  }
}

export default new ReportController();
