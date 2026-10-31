import { FastifyInstance } from 'fastify';
import customerController from '../controllers/customer.controller';
import { authenticateToken } from '../middleware/auth.middleware';

export default async function customerRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.addHook('preHandler', authenticateToken);

  fastify.post('/create-customer', customerController.createCustomer.bind(customerController));
  fastify.get('/getAll-customer', customerController.getAllCustomers.bind(customerController));
  fastify.get('/customer/:customer_id', customerController.getCustomerById.bind(customerController));
  fastify.put('/customer/:customer_id/update-customer', customerController.updateCustomer.bind(customerController));
  fastify.delete('/customer/:customer_id/delete-customer', customerController.deleteCustomer.bind(customerController));
  fastify.get('/customer/:customer_id/bookings', customerController.getCustomerBookings.bind(customerController));
}
