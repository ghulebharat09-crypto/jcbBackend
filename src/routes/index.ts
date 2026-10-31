import { FastifyInstance } from 'fastify';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import customerRoutes from './customer.routes';
import machineRoutes from './machine.routes';
import operatorRoutes from './operator.routes';
import bookingRoutes from './booking.routes';
import maintenanceRoutes from './maintenance.routes';
import paymentRoutes from './payment.routes';
import invoiceRoutes from './invoice.routes';
import dashboardRoutes from './dashboard.routes';
import scheduleRoutes from './schedule.routes';
import reportRoutes from './report.routes';
import profileRoutes from './profile.routes';

export default async function rootRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.register(authRoutes, { prefix: '/auth' });
  fastify.register(userRoutes, { prefix: '/users' });
  fastify.register(customerRoutes, { prefix: '/customers' });
  fastify.register(machineRoutes, { prefix: '/machines' });
  fastify.register(operatorRoutes, { prefix: '/operators' });
  fastify.register(bookingRoutes, { prefix: '/bookings' });
  fastify.register(maintenanceRoutes, { prefix: '/maintenance' });
  fastify.register(paymentRoutes, { prefix: '/payments' });
  fastify.register(invoiceRoutes, { prefix: '/invoices' });
  fastify.register(dashboardRoutes, { prefix: '/dashboard' });
  fastify.register(scheduleRoutes, { prefix: '/schedule' });
  fastify.register(reportRoutes, { prefix: '/reports' });
  fastify.register(profileRoutes, { prefix: '/profile' });
}
