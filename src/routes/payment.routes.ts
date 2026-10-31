import { FastifyInstance } from 'fastify';
import paymentController from '../controllers/payment.controller';
import { authenticateToken } from '../middleware/auth.middleware';

export default async function paymentRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.addHook('preHandler', authenticateToken);

  fastify.post('/create-payment', paymentController.createPayment.bind(paymentController));
  fastify.get('/getAll-payment', paymentController.getAllPayments.bind(paymentController));
  fastify.get('/payment/:payment_id', paymentController.getPaymentById.bind(paymentController));
  fastify.get('/booking/:booking_id', paymentController.getPaymentsByBooking.bind(paymentController));
  fastify.get('/calculate-bill/:booking_id', paymentController.calculateBill.bind(paymentController));
}
