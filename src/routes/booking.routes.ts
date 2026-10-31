import { FastifyInstance } from 'fastify';
import bookingController from '../controllers/booking.controller';
import { authenticateToken } from '../middleware/auth.middleware';

export default async function bookingRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.addHook('preHandler', authenticateToken);

  fastify.post('/create-booking', bookingController.createBooking.bind(bookingController));
  fastify.get('/getAll-booking', bookingController.getAllBookings.bind(bookingController));
  fastify.get('/booking/:booking_id', bookingController.getBookingById.bind(bookingController));
  fastify.put('/booking/:booking_id/update-booking', bookingController.updateBooking.bind(bookingController));
  fastify.patch('/booking/:booking_id/update-status', bookingController.updateBookingStatus.bind(bookingController));
  fastify.patch('/booking/:booking_id/cancel-booking', bookingController.cancelBooking.bind(bookingController));
  fastify.delete('/booking/:booking_id/delete-booking', bookingController.deleteBooking.bind(bookingController));
}
