import { FastifyInstance } from 'fastify';
import profileController from '../controllers/profile.controller';
import { authenticateToken } from '../middleware/auth.middleware';

export default async function profileRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.addHook('preHandler', authenticateToken);

  fastify.get('/get-profile', profileController.getProfile.bind(profileController));
  fastify.put('/update-profile', profileController.updateProfile.bind(profileController));
  fastify.put('/change-password', profileController.changePassword.bind(profileController));
}
