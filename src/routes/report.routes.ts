import { FastifyInstance } from 'fastify';
import reportController from '../controllers/report.controller';
import { authenticateToken } from '../middleware/auth.middleware';

export default async function reportRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.addHook('preHandler', authenticateToken);

  fastify.get('/revenue-analytics', reportController.getRevenueAnalytics.bind(reportController));
  fastify.get('/fleet-utilization', reportController.getFleetUtilization.bind(reportController));
}
