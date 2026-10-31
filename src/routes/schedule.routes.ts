import { FastifyInstance } from 'fastify';
import scheduleController from '../controllers/schedule.controller';
import { authenticateToken } from '../middleware/auth.middleware';

export default async function scheduleRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.addHook('preHandler', authenticateToken);

  fastify.get('/daily-schedule', scheduleController.getDailySchedule.bind(scheduleController));
  fastify.get('/weekly-schedule', scheduleController.getWeeklySchedule.bind(scheduleController));
}
