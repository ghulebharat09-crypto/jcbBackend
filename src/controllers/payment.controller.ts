import { FastifyRequest, FastifyReply } from 'fastify';
import paymentService from '../services/payment.service';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.util';
import { CreatePaymentInput } from '../interface/payment.interface';

export class PaymentController {
  async createPayment(request: FastifyRequest<{ Body: CreatePaymentInput }>, reply: FastifyReply) {
    try {
      const payment = await paymentService.createPayment(request.body);
      return sendSuccess(reply, 'Payment processed successfully', payment, 201);
    } catch (error: any) {
      return sendError(reply, error.message || 'Payment processing failed', 400);
    }
  }

  async getAllPayments(
    request: FastifyRequest<{ Querystring: { page?: number; limit?: number; booking_id?: string } }>,
    reply: FastifyReply
  ) {
    try {
      const page = Number(request.query.page) || 1;
      const limit = Number(request.query.limit) || 10;
      const { payments, total } = await paymentService.getAllPayments(request.query);
      return sendPaginated(reply, 'Payments retrieved successfully', payments, total, page, limit);
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to retrieve payments', 500);
    }
  }

  async getPaymentById(request: FastifyRequest<{ Params: { payment_id: string } }>, reply: FastifyReply) {
    try {
      const payment = await paymentService.getPaymentById(request.params.payment_id);
      return sendSuccess(reply, 'Payment details retrieved successfully', payment);
    } catch (error: any) {
      return sendError(reply, error.message || 'Payment not found', 404);
    }
  }

  async getPaymentsByBooking(request: FastifyRequest<{ Params: { booking_id: string } }>, reply: FastifyReply) {
    try {
      const payments = await paymentService.getPaymentsByBooking(request.params.booking_id);
      return sendSuccess(reply, 'Booking payments retrieved successfully', payments);
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to retrieve payments', 500);
    }
  }

  async calculateBill(request: FastifyRequest<{ Params: { booking_id: string } }>, reply: FastifyReply) {
    try {
      const calculation = await paymentService.calculateBill(request.params.booking_id);
      return sendSuccess(reply, 'Billing calculation generated', calculation);
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to calculate bill', 400);
    }
  }
}

export default new PaymentController();
