import { FastifyInstance } from 'fastify';
import authController from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';

export default async function authRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post('/login', authController.login.bind(authController));
  fastify.post('/signup', authController.signup.bind(authController));
  fastify.post('/forgot-password', authController.forgotPassword.bind(authController));
  fastify.post('/reset-password', authController.resetPassword.bind(authController));
  fastify.get('/me', { preHandler: [authenticateToken] }, authController.getMe.bind(authController));
}
