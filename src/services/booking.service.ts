import { Op } from 'sequelize';
import Booking from '../models/booking.model';
import Customer from '../models/customer.model';
import Machine from '../models/machine.model';
import Operator from '../models/operator.model';
import Payment from '../models/payment.model';
import Invoice from '../models/invoice.model';
import { sequelize } from '../plugins/sequelize-plugin';
import { CreateBookingInput, UpdateBookingInput, BookingQueryFilter, BookingStatus } from '../interface/booking.interface';
import { generateBookingNumber } from '../utils/code-generator.util';

export class BookingService {
  async createBooking(input: CreateBookingInput): Promise<Booking> {
    const transaction = await sequelize.transaction();

    try {
      // 1. Verify Customer
      const customer = await Customer.findOne({
        where: { id: input.customer_id, is_deleted: false },
        transaction,
      });
      if (!customer) {
        throw new Error('Customer not found');
      }

      // 2. Verify Machine
      const machine = await Machine.findOne({
        where: { id: input.machine_id, is_deleted: false },
        transaction,
      });
      if (!machine) {
        throw new Error('Machine not found');
      }
      if (machine.status === 'maintenance') {
        throw new Error('Machine is currently undergoing maintenance and cannot be booked');
      }

      // 3. Date conflict check for the machine
      const conflictingBooking = await Booking.findOne({
        where: {
          machine_id: input.machine_id,
          status: { [Op.in]: ['scheduled', 'active'] },
          is_deleted: false,
          [Op.or]: [
            {
              start_date: { [Op.between]: [input.start_date, input.end_date] },
            },
            {
              end_date: { [Op.between]: [input.start_date, input.end_date] },
            },
            {
              [Op.and]: [
                { start_date: { [Op.lte]: input.start_date } },
                { end_date: { [Op.gte]: input.end_date } },
              ],
            },
          ],
        },
        transaction,
      });

      if (conflictingBooking) {
        throw new Error(
          `Machine is already booked for dates between ${conflictingBooking.start_date} and ${conflictingBooking.end_date} (Booking: ${conflictingBooking.booking_number})`
        );
      }

      // 4. Rate and Cost calculation
      let baseRate = 0;
      let estimatedCost = 0;
      const hours = Number(input.estimated_hours) || 24;

      if (input.rental_type === 'hourly') {
        baseRate = machine.hourly_rate;
        estimatedCost = hours * baseRate;
      } else {
        baseRate = machine.daily_rate;
        const start = new Date(input.start_date);
        const end = new Date(input.end_date);
        const diffDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1);
        estimatedCost = diffDays * baseRate;
      }

      const advancePayment = Number(input.advance_payment) || 0;
      const remainingBalance = Math.max(0, estimatedCost - advancePayment);

      const bookingNumber = generateBookingNumber();

      // 5. Create Booking
      const booking = await Booking.create(
        {
          booking_number: bookingNumber,
          customer_id: input.customer_id,
          machine_id: input.machine_id,
          operator_id: input.operator_id || null,
          site_location: input.site_location,
          work_description: input.work_description || null,
          start_date: input.start_date,
          end_date: input.end_date,
          rental_type: input.rental_type,
          estimated_hours: hours,
          base_rate: baseRate,
          estimated_cost: estimatedCost,
          advance_payment: advancePayment,
          remaining_balance: remainingBalance,
          status: 'scheduled',
          is_deleted: false,
        },
        { transaction }
      );

      // 6. Record Advance Payment if received
      if (advancePayment > 0) {
        await Payment.create(
          {
            booking_id: booking.id,
            payment_type: 'advance',
            payment_method: 'cash',
            base_charge: 0,
            overtime_charge: 0,
            fuel_transport_charge: 0,
            advance_adjustment: 0,
            total_amount: advancePayment,
            status: 'paid',
            paid_at: new Date(),
            notes: `Advance payment recorded at booking creation (${bookingNumber})`,
          },
          { transaction }
        );
      }

      // 7. Update Machine & Operator status
      machine.status = 'rented_out';
      await machine.save({ transaction });

      if (input.operator_id) {
        const operator = await Operator.findOne({
          where: { id: input.operator_id, is_deleted: false },
          transaction,
        });
        if (operator) {
          operator.status = 'on_duty';
          await operator.save({ transaction });
        }
      }

      await transaction.commit();

      return await this.getBookingById(booking.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getAllBookings(filters: BookingQueryFilter): Promise<{ bookings: Booking[]; total: number }> {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(filters.limit) || 10));
    const offset = (page - 1) * limit;

    const where: any = { is_deleted: false };

    if (filters.search) {
      where[Op.or] = [
        { booking_number: { [Op.like]: `%${filters.search}%` } },
        { site_location: { [Op.like]: `%${filters.search}%` } },
      ];
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.customer_id) {
      where.customer_id = filters.customer_id;
    }

    if (filters.machine_id) {
      where.machine_id = filters.machine_id;
    }

    if (filters.from_date && filters.to_date) {
      where.start_date = { [Op.between]: [filters.from_date, filters.to_date] };
    }

    const { rows, count } = await Booking.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [
        { model: Customer, as: 'customer', attributes: ['id', 'name', 'phone', 'company_name'] },
        { model: Machine, as: 'machine', attributes: ['id', 'name', 'model', 'registration_number'] },
        { model: Operator, as: 'operator', attributes: ['id', 'name', 'phone'] },
        { model: Payment, as: 'payments' },
        { model: Invoice, as: 'invoice' },
      ],
    });

    return { bookings: rows, total: count };
  }

  async getBookingById(bookingId: string): Promise<Booking> {
    const booking = await Booking.findOne({
      where: { id: bookingId, is_deleted: false },
      include: [
        { model: Customer, as: 'customer' },
        { model: Machine, as: 'machine' },
        { model: Operator, as: 'operator' },
        { model: Payment, as: 'payments' },
        { model: Invoice, as: 'invoice' },
      ],
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    return booking;
  }

  async updateBooking(bookingId: string, input: UpdateBookingInput): Promise<Booking> {
    const booking = await Booking.findOne({
      where: { id: bookingId, is_deleted: false },
    });
    if (!booking) {
      throw new Error('Booking not found');
    }

    if (input.site_location) booking.site_location = input.site_location;
    if (input.work_description !== undefined) booking.work_description = input.work_description;
    if (input.operator_id !== undefined) booking.operator_id = input.operator_id;

    if (input.status) {
      booking.status = input.status;
    }

    await booking.save();
    return await this.getBookingById(bookingId);
  }

  async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<Booking> {
    const transaction = await sequelize.transaction();
    try {
      const booking = await Booking.findOne({
        where: { id: bookingId, is_deleted: false },
        transaction,
      });
      if (!booking) {
        throw new Error('Booking not found');
      }

      booking.status = status;
      await booking.save({ transaction });

      // If booking is completed, release machine and operator
      if (status === 'completed') {
        const machine = await Machine.findByPk(booking.machine_id, { transaction });
        if (machine && machine.status === 'rented_out') {
          machine.status = 'available';
          await machine.save({ transaction });
        }

        if (booking.operator_id) {
          const operator = await Operator.findByPk(booking.operator_id, { transaction });
          if (operator && operator.status === 'on_duty') {
            operator.status = 'available';
            await operator.save({ transaction });
          }
        }
      }

      await transaction.commit();
      return await this.getBookingById(bookingId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async cancelBooking(bookingId: string, cancelledReason: string): Promise<Booking> {
    const transaction = await sequelize.transaction();
    try {
      const booking = await Booking.findOne({
        where: { id: bookingId, is_deleted: false },
        transaction,
      });
      if (!booking) {
        throw new Error('Booking not found');
      }

      booking.status = 'cancelled';
      booking.cancelled_reason = cancelledReason || 'Cancelled by user';
      await booking.save({ transaction });

      // Release machine
      const machine = await Machine.findByPk(booking.machine_id, { transaction });
      if (machine && machine.status === 'rented_out') {
        machine.status = 'available';
        await machine.save({ transaction });
      }

      // Release operator
      if (booking.operator_id) {
        const operator = await Operator.findByPk(booking.operator_id, { transaction });
        if (operator && operator.status === 'on_duty') {
          operator.status = 'available';
          await operator.save({ transaction });
        }
      }

      await transaction.commit();
      return await this.getBookingById(bookingId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async deleteBooking(bookingId: string): Promise<{ success: boolean; message: string }> {
    const booking = await Booking.findOne({
      where: { id: bookingId, is_deleted: false },
    });
    if (!booking) {
      throw new Error('Booking not found');
    }

    booking.is_deleted = true;
    await booking.save();

    return { success: true, message: 'Booking soft deleted successfully' };
  }
}

export default new BookingService();
