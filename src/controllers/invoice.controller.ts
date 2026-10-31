import { FastifyRequest, FastifyReply } from 'fastify';
import invoiceService from '../services/invoice.service';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.util';
import { CreateInvoiceInput } from '../interface/invoice.interface';

export class InvoiceController {
  async createInvoice(request: FastifyRequest<{ Body: CreateInvoiceInput }>, reply: FastifyReply) {
    try {
      const invoice = await invoiceService.createInvoice(request.body);
      return sendSuccess(reply, 'Invoice generated successfully', invoice, 201);
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to create invoice', 400);
    }
  }

  async getAllInvoices(
    request: FastifyRequest<{ Querystring: { page?: number; limit?: number; customer_id?: string } }>,
    reply: FastifyReply
  ) {
    try {
      const page = Number(request.query.page) || 1;
      const limit = Number(request.query.limit) || 10;
      const { invoices, total } = await invoiceService.getAllInvoices(request.query);
      return sendPaginated(reply, 'Invoices retrieved successfully', invoices, total, page, limit);
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to retrieve invoices', 500);
    }
  }

  async getInvoiceById(request: FastifyRequest<{ Params: { invoice_id: string } }>, reply: FastifyReply) {
    try {
      const invoice = await invoiceService.getInvoiceById(request.params.invoice_id);
      return sendSuccess(reply, 'Invoice retrieved successfully', invoice);
    } catch (error: any) {
      return sendError(reply, error.message || 'Invoice not found', 404);
    }
  }

  async getInvoiceByBooking(request: FastifyRequest<{ Params: { booking_id: string } }>, reply: FastifyReply) {
    try {
      const invoice = await invoiceService.getInvoiceByBooking(request.params.booking_id);
      if (!invoice) {
        return sendError(reply, 'No invoice found for this booking', 404);
      }
      return sendSuccess(reply, 'Booking invoice retrieved successfully', invoice);
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to retrieve invoice', 500);
    }
  }
}

export default new InvoiceController();
