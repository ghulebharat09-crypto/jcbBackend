import { Op } from 'sequelize';
import Booking from '../models/booking.model';
import Customer from '../models/customer.model';
import Machine from '../models/machine.model';
import Operator from '../models/operator.model';
import { ScheduleShiftItem } from '../interface/schedule.interface';

export class ScheduleService {
  async getDailySchedule(targetDate?: string): Promise<ScheduleShiftItem[]> {
    const date = targetDate || new Date().toISOString().split('T')[0];

    const bookings = await Booking.findAll({
      where: {
        is_deleted: false,
        status: { [Op.in]: ['scheduled', 'active'] },
        start_date: { [Op.lte]: date },
        end_date: { [Op.gte]: date },
      },
      include: [
        { model: Customer, as: 'customer' },
        { model: Machine, as: 'machine' },
        { model: Operator, as: 'operator' },
      ],
      order: [['start_date', 'ASC']],
    });

    return bookings.map((b) => {
      const cust = (b as any).customer;
      const mach = (b as any).machine;
      const op = (b as any).operator;

      return {
        booking_id: b.id,
        booking_number: b.booking_number,
        customer_name: cust ? cust.name : 'Unknown',
        machine_id: b.machine_id,
        machine_name: mach ? mach.name : 'Unknown',
        registration_number: mach ? mach.registration_number : '',
        operator_id: b.operator_id,
        operator_name: op ? op.name : 'Unassigned',
        site_location: b.site_location,
        start_date: String(b.start_date),
        end_date: String(b.end_date),
        rental_type: b.rental_type,
        status: b.status,
      };
    });
  }

  async getWeeklySchedule(startDate?: string): Promise<ScheduleShiftItem[]> {
    const start = startDate ? new Date(startDate) : new Date();
    const end = new Date(start);
    end.setDate(start.getDate() + 7);

    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    const bookings = await Booking.findAll({
      where: {
        is_deleted: false,
        status: { [Op.in]: ['scheduled', 'active'] },
        [Op.or]: [
          { start_date: { [Op.between]: [startStr, endStr] } },
          { end_date: { [Op.between]: [startStr, endStr] } },
          {
            [Op.and]: [{ start_date: { [Op.lte]: startStr } }, { end_date: { [Op.gte]: endStr } }],
          },
        ],
      },
      include: [
        { model: Customer, as: 'customer' },
        { model: Machine, as: 'machine' },
        { model: Operator, as: 'operator' },
      ],
      order: [['start_date', 'ASC']],
    });

    return bookings.map((b) => {
      const cust = (b as any).customer;
      const mach = (b as any).machine;
      const op = (b as any).operator;

      return {
        booking_id: b.id,
        booking_number: b.booking_number,
        customer_name: cust ? cust.name : 'Unknown',
        machine_id: b.machine_id,
        machine_name: mach ? mach.name : 'Unknown',
        registration_number: mach ? mach.registration_number : '',
        operator_id: b.operator_id,
        operator_name: op ? op.name : 'Unassigned',
        site_location: b.site_location,
        start_date: String(b.start_date),
        end_date: String(b.end_date),
        rental_type: b.rental_type,
        status: b.status,
      };
    });
  }
}

export default new ScheduleService();
