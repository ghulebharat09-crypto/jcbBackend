import { Op } from 'sequelize';
import Payment from '../models/payment.model';
import Booking from '../models/booking.model';
import Customer from '../models/customer.model';
import Machine from '../models/machine.model';
import { sequelize } from '../plugins/sequelize-plugin';
import { CreatePaymentInput, BillingCalculationDto } from '../interface/payment.interface';

export class PaymentService {
  async createPayment(input: CreatePaymentInput): Promise<Payment> {
    const transaction = await sequelize.transaction();
    try {
      const booking = await Booking.findOne({
        where: { id: input.booking_id, is_deleted: false },
        transaction,
      });
      if (!booking) {
        throw new Error('Booking not found');
      }

      const payment = await Payment.create(
        {
          booking_id: input.booking_id,
          payment_type: input.payment_type,
          payment_method: input.payment_method,
          base_charge: input.base_charge || 0,
          overtime_charge: input.overtime_charge || 0,
          fuel_transport_charge: input.fuel_transport_charge || 0,
          advance_adjustment: input.advance_adjustment || 0,
          total_amount: input.total_amount,
          status: input.status || 'paid',
          paid_at: new Date(),
          notes: input.notes || null,
        },
        { transaction }
      );

      // Recalculate remaining balance
      const newBalance = Math.max(0, booking.remaining_balance - input.total_amount);
      booking.remaining_balance = newBalance;

      // If fully paid and final payment, mark booking as completed
      if (input.payment_type === 'final' || newBalance === 0) {
        if (booking.status === 'active') {
          booking.status = 'completed';
          const machine = await Machine.findByPk(booking.machine_id, { transaction });
          if (machine && machine.status === 'rented_out') {
            machine.status = 'available';
            await machine.save({ transaction });
          }
        }
      }

      await booking.save({ transaction });
      await transaction.commit();

      return payment;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getAllPayments(filters: { page?: number; limit?: number; booking_id?: string }): Promise<{ payments: Payment[]; total: number }> {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(filters.limit) || 10));
    const offset = (page - 1) * limit;

    const where: any = {};
    if (filters.booking_id) {
      where.booking_id = filters.booking_id;
    }

    const { rows, count } = await Payment.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: Booking,
          as: 'booking',
          include: [
            { model: Customer, as: 'customer', attributes: ['id', 'name', 'phone'] },
            { model: Machine, as: 'machine', attributes: ['id', 'name', 'registration_number'] },
          ],
        },
      ],
    });

    return { payments: rows, total: count };
  }

  async getPaymentById(paymentId: string): Promise<Payment> {
    const payment = await Payment.findOne({
      where: { id: paymentId },
      include: [
        {
          model: Booking,
          as: 'booking',
          include: [
            { model: Customer, as: 'customer' },
            { model: Machine, as: 'machine' },
          ],
        },
      ],
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    return payment;
  }

  async getPaymentsByBooking(bookingId: string): Promise<Payment[]> {
    return await Payment.findAll({
      where: { booking_id: bookingId },
      order: [['created_at', 'ASC']],
    });
  }

  async calculateBill(bookingId: string): Promise<BillingCalculationDto> {
    const booking = await Booking.findOne({
      where: { id: bookingId, is_deleted: false },
      include: [
        { model: Customer, as: 'customer' },
        { model: Machine, as: 'machine' },
        { model: Payment, as: 'payments' },
      ],
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    const customer = (booking as any).customer;
    const machine = (booking as any).machine;
    const payments = (booking as any).payments || [];

    const advancePayments = payments
      .filter((p: Payment) => p.payment_type === 'advance' && p.status === 'paid')
      .reduce((sum: number, p: Payment) => sum + p.total_amount, 0);

    const baseCharge = booking.estimated_cost;
    const overtimeCharge = 0; // Default estimate
    const fuelCharge = 0; // Default estimate
    const totalEstimated = baseCharge + overtimeCharge + fuelCharge - advancePayments;

    return {
      booking_id: booking.id,
      customer_name: customer ? customer.name : 'Unknown',
      machine_name: machine ? `${machine.name} (${machine.registration_number})` : 'Unknown',
      start_date: String(booking.start_date),
      end_date: String(booking.end_date),
      estimated_hours: booking.estimated_hours,
      base_rate: booking.base_rate,
      base_charge: baseCharge,
      suggested_overtime_charge: overtimeCharge,
      suggested_fuel_transport: fuelCharge,
      advance_received: advancePayments,
      total_estimated_payable: Math.max(0, totalEstimated),
      remaining_balance: booking.remaining_balance,
    };
  }
}

export default new PaymentService();
