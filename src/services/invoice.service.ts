import Invoice from '../models/invoice.model';
import InvoiceItem from '../models/invoice-item.model';
import Booking from '../models/booking.model';
import Customer from '../models/customer.model';
import Machine from '../models/machine.model';
import Payment from '../models/payment.model';
import { sequelize } from '../plugins/sequelize-plugin';
import { CreateInvoiceInput } from '../interface/invoice.interface';
import { generateInvoiceNumber } from '../utils/code-generator.util';

export class InvoiceService {
  async createInvoice(input: CreateInvoiceInput): Promise<Invoice> {
    const transaction = await sequelize.transaction();
    try {
      const invoiceNumber = generateInvoiceNumber();

      const invoice = await Invoice.create(
        {
          invoice_number: invoiceNumber,
          booking_id: input.booking_id,
          customer_id: input.customer_id,
          payment_id: input.payment_id || null,
          subtotal: input.subtotal,
          advance_credit: input.advance_credit || 0,
          total_paid: input.total_paid,
          status: input.status || 'generated',
          pdf_url: input.pdf_url || null,
          issued_at: new Date(),
        },
        { transaction }
      );

      if (input.items && input.items.length > 0) {
        const itemsToCreate = input.items.map((item) => ({
          invoice_id: invoice.id,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unit_price,
          amount: item.amount,
        }));
        await InvoiceItem.bulkCreate(itemsToCreate, { transaction });
      }

      await transaction.commit();

      return await this.getInvoiceById(invoice.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getAllInvoices(filters: { page?: number; limit?: number; customer_id?: string }): Promise<{ invoices: Invoice[]; total: number }> {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(filters.limit) || 10));
    const offset = (page - 1) * limit;

    const where: any = {};
    if (filters.customer_id) {
      where.customer_id = filters.customer_id;
    }

    const { rows, count } = await Invoice.findAndCountAll({
      where,
      limit,
      offset,
      order: [['issued_at', 'DESC']],
      include: [
        { model: Customer, as: 'customer', attributes: ['id', 'name', 'phone', 'company_name'] },
        { model: InvoiceItem, as: 'items' },
        {
          model: Booking,
          as: 'booking',
          include: [{ model: Machine, as: 'machine', attributes: ['id', 'name', 'registration_number'] }],
        },
      ],
    });

    return { invoices: rows, total: count };
  }

  async getInvoiceById(invoiceId: string): Promise<Invoice> {
    const invoice = await Invoice.findOne({
      where: { id: invoiceId },
      include: [
        { model: Customer, as: 'customer' },
        { model: InvoiceItem, as: 'items' },
        {
          model: Booking,
          as: 'booking',
          include: [{ model: Machine, as: 'machine' }],
        },
        { model: Payment, as: 'payment' },
      ],
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    return invoice;
  }

  async getInvoiceByBooking(bookingId: string): Promise<Invoice | null> {
    return await Invoice.findOne({
      where: { booking_id: bookingId },
      include: [
        { model: Customer, as: 'customer' },
        { model: InvoiceItem, as: 'items' },
      ],
    });
  }
}

export default new InvoiceService();
