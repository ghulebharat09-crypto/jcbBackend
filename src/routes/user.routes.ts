import { FastifyInstance } from 'fastify';
import userController from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';

export default async function userRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.addHook('preHandler', authenticateToken);
  fastify.addHook('preHandler', requireAdmin);

  fastify.post('/create-user', userController.createUser.bind(userController));
  fastify.get('/getAll-user', userController.getAllUsers.bind(userController));
  fastify.get('/user/:user_id', userController.getUserById.bind(userController));
  fastify.put('/user/:user_id/update-user', userController.updateUser.bind(userController));
  fastify.delete('/user/:user_id/delete-user', userController.deleteUser.bind(userController));
}
