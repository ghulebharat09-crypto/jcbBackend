import { FastifyInstance } from 'fastify';
import dashboardController from '../controllers/dashboard.controller';
import { authenticateToken } from '../middleware/auth.middleware';

export default async function dashboardRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.addHook('preHandler', authenticateToken);

  fastify.get('/get-summary', dashboardController.getSummary.bind(dashboardController));
  fastify.get('/recent-bookings', dashboardController.getRecentBookings.bind(dashboardController));
}
