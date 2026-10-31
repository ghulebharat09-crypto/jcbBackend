import { FastifyRequest, FastifyReply } from 'fastify';
import customerService from '../services/customer.service';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.util';
import { CreateCustomerInput, UpdateCustomerInput, CustomerQueryFilter } from '../interface/customer.interface';

export class CustomerController {
  async createCustomer(request: FastifyRequest<{ Body: CreateCustomerInput }>, reply: FastifyReply) {
    try {
      const customer = await customerService.createCustomer(request.body);
      return sendSuccess(reply, 'Customer created successfully', customer, 201);
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to create customer', 400);
    }
  }

  async getAllCustomers(request: FastifyRequest<{ Querystring: CustomerQueryFilter }>, reply: FastifyReply) {
    try {
      const page = Number(request.query.page) || 1;
      const limit = Number(request.query.limit) || 10;
      const { customers, total } = await customerService.getAllCustomers(request.query);
      return sendPaginated(reply, 'Customers retrieved successfully', customers, total, page, limit);
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to retrieve customers', 500);
    }
  }

  async getCustomerById(request: FastifyRequest<{ Params: { customer_id: string } }>, reply: FastifyReply) {
    try {
      const customer = await customerService.getCustomerById(request.params.customer_id);
      return sendSuccess(reply, 'Customer retrieved successfully', customer);
    } catch (error: any) {
      return sendError(reply, error.message || 'Customer not found', 404);
    }
  }

  async updateCustomer(
    request: FastifyRequest<{ Params: { customer_id: string }; Body: UpdateCustomerInput }>,
    reply: FastifyReply
  ) {
    try {
      const customer = await customerService.updateCustomer(request.params.customer_id, request.body);
      return sendSuccess(reply, 'Customer updated successfully', customer);
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to update customer', 400);
    }
  }

  async deleteCustomer(request: FastifyRequest<{ Params: { customer_id: string } }>, reply: FastifyReply) {
    try {
      const result = await customerService.deleteCustomer(request.params.customer_id);
      return sendSuccess(reply, result.message);
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to delete customer', 400);
    }
  }

  async getCustomerBookings(request: FastifyRequest<{ Params: { customer_id: string } }>, reply: FastifyReply) {
    try {
      const bookings = await customerService.getCustomerBookings(request.params.customer_id);
      return sendSuccess(reply, 'Customer bookings retrieved successfully', bookings);
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to retrieve bookings', 500);
    }
  }
}

export default new CustomerController();
