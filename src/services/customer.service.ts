import { Op } from 'sequelize';
import Customer from '../models/customer.model';
import Booking from '../models/booking.model';
import Machine from '../models/machine.model';
import { CreateCustomerInput, UpdateCustomerInput, CustomerQueryFilter } from '../interface/customer.interface';
import { hashPassword } from '../utils/password.util';

export class CustomerService {
  async createCustomer(input: CreateCustomerInput): Promise<Customer> {
    const existing = await Customer.findOne({
      where: { phone: input.phone, is_deleted: false },
    });
    if (existing) {
      throw new Error(`Customer with phone ${input.phone} already exists`);
    }

    if (input.email) {
      const emailExisting = await Customer.findOne({
        where: { email: input.email, is_deleted: false },
      });
      if (emailExisting) {
        throw new Error(`Customer with email ${input.email} already exists`);
      }
    }

    let password_hash: string | null = null;
    if (input.password) {
      password_hash = await hashPassword(input.password);
    }

    const customerType =
      input.customer_type ||
      (input.company_name && input.company_name.trim().length > 0 ? 'corporate' : 'individual');

    return await Customer.create({
      name: input.name,
      company_name: input.company_name || null,
      phone: input.phone,
      email: input.email || null,
      password_hash,
      address: input.address || null,
      customer_type: customerType,
      is_active: true,
      is_deleted: false,
    });
  }

  async getAllCustomers(filters: CustomerQueryFilter): Promise<{ customers: Customer[]; total: number }> {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(filters.limit) || 10));
    const offset = (page - 1) * limit;

    const where: any = { is_deleted: false };

    if (filters.search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${filters.search}%` } },
        { phone: { [Op.like]: `%${filters.search}%` } },
        { company_name: { [Op.like]: `%${filters.search}%` } },
        { email: { [Op.like]: `%${filters.search}%` } },
      ];
    }

    if (filters.customer_type) {
      where.customer_type = filters.customer_type;
    }

    if (filters.is_active !== undefined) {
      where.is_active = String(filters.is_active) === 'true';
    }

    const { rows, count } = await Customer.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });

    return { customers: rows, total: count };
  }

  async getCustomerById(customerId: string): Promise<Customer> {
    const customer = await Customer.findOne({
      where: { id: customerId, is_deleted: false },
      include: [
        {
          model: Booking,
          as: 'bookings',
          where: { is_deleted: false },
          required: false,
          include: [{ model: Machine, as: 'machine' }],
        },
      ],
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    return customer;
  }

  async updateCustomer(customerId: string, input: UpdateCustomerInput): Promise<Customer> {
    const customer = await Customer.findOne({
      where: { id: customerId, is_deleted: false },
    });
    if (!customer) {
      throw new Error('Customer not found');
    }

    if (input.phone && input.phone !== customer.phone) {
      const existing = await Customer.findOne({
        where: { phone: input.phone, is_deleted: false, id: { [Op.ne]: customerId } },
      });
      if (existing) {
        throw new Error('Phone number already in use by another customer');
      }
      customer.phone = input.phone;
    }

    if (input.name) customer.name = input.name;
    if (input.company_name !== undefined) customer.company_name = input.company_name || null;
    if (input.email !== undefined) customer.email = input.email || null;
    if (input.address !== undefined) customer.address = input.address || null;
    if (input.customer_type) customer.customer_type = input.customer_type;
    if (input.is_active !== undefined) customer.is_active = input.is_active;

    await customer.save();
    return customer;
  }

  async deleteCustomer(customerId: string): Promise<{ success: boolean; message: string }> {
    const customer = await Customer.findOne({
      where: { id: customerId, is_deleted: false },
    });
    if (!customer) {
      throw new Error('Customer not found');
    }

    customer.is_deleted = true;
    await customer.save();

    return { success: true, message: 'Customer soft deleted successfully' };
  }

  async getCustomerBookings(customerId: string): Promise<Booking[]> {
    return await Booking.findAll({
      where: { customer_id: customerId, is_deleted: false },
      include: [{ model: Machine, as: 'machine' }],
      order: [['created_at', 'DESC']],
    });
  }
}

export default new CustomerService();
