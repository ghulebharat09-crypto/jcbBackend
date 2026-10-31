import { FastifyInstance } from 'fastify';
import invoiceController from '../controllers/invoice.controller';
import { authenticateToken } from '../middleware/auth.middleware';

export default async function invoiceRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.addHook('preHandler', authenticateToken);

  fastify.post('/create-invoice', invoiceController.createInvoice.bind(invoiceController));
  fastify.get('/getAll-invoice', invoiceController.getAllInvoices.bind(invoiceController));
  fastify.get('/invoice/:invoice_id', invoiceController.getInvoiceById.bind(invoiceController));
  fastify.get('/booking/:booking_id', invoiceController.getInvoiceByBooking.bind(invoiceController));
}
