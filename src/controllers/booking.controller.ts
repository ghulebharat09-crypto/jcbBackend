import { FastifyRequest, FastifyReply } from 'fastify';
import bookingService from '../services/booking.service';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.util';
import { CreateBookingInput, UpdateBookingInput, BookingQueryFilter, BookingStatus } from '../interface/booking.interface';

export class BookingController {
  async createBooking(request: FastifyRequest<{ Body: CreateBookingInput }>, reply: FastifyReply) {
    try {
      const booking = await bookingService.createBooking(request.body);
      return sendSuccess(reply, 'Booking created successfully', booking, 201);
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to create booking', 400);
    }
  }

  async getAllBookings(request: FastifyRequest<{ Querystring: BookingQueryFilter }>, reply: FastifyReply) {
    try {
      const page = Number(request.query.page) || 1;
      const limit = Number(request.query.limit) || 10;
      const { bookings, total } = await bookingService.getAllBookings(request.query);
      return sendPaginated(reply, 'Bookings retrieved successfully', bookings, total, page, limit);
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to retrieve bookings', 500);
    }
  }

  async getBookingById(request: FastifyRequest<{ Params: { booking_id: string } }>, reply: FastifyReply) {
    try {
      const booking = await bookingService.getBookingById(request.params.booking_id);
      return sendSuccess(reply, 'Booking details retrieved successfully', booking);
    } catch (error: any) {
      return sendError(reply, error.message || 'Booking not found', 404);
    }
  }

  async updateBooking(
    request: FastifyRequest<{ Params: { booking_id: string }; Body: UpdateBookingInput }>,
    reply: FastifyReply
  ) {
    try {
      const booking = await bookingService.updateBooking(request.params.booking_id, request.body);
      return sendSuccess(reply, 'Booking updated successfully', booking);
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to update booking', 400);
    }
  }

  async updateBookingStatus(
    request: FastifyRequest<{ Params: { booking_id: string }; Body: { status: BookingStatus } }>,
    reply: FastifyReply
  ) {
    try {
      const booking = await bookingService.updateBookingStatus(request.params.booking_id, request.body.status);
      return sendSuccess(reply, 'Booking status updated successfully', booking);
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to update status', 400);
    }
  }

  async cancelBooking(
    request: FastifyRequest<{ Params: { booking_id: string }; Body: { reason: string } }>,
    reply: FastifyReply
  ) {
    try {
      const booking = await bookingService.cancelBooking(request.params.booking_id, request.body?.reason);
      return sendSuccess(reply, 'Booking cancelled successfully', booking);
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to cancel booking', 400);
    }
  }

  async deleteBooking(request: FastifyRequest<{ Params: { booking_id: string } }>, reply: FastifyReply) {
    try {
      const result = await bookingService.deleteBooking(request.params.booking_id);
      return sendSuccess(reply, result.message);
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to delete booking', 400);
    }
  }
}

export default new BookingController();
