import { Op, fn, col } from 'sequelize';
import Machine from '../models/machine.model';
import Customer from '../models/customer.model';
import Booking from '../models/booking.model';
import Payment from '../models/payment.model';
import { DashboardSummaryDto } from '../interface/dashboard.interface';

export class DashboardService {
  async getSummary(): Promise<DashboardSummaryDto> {
    const totalMachines = await Machine.count({ where: { is_deleted: false } });
    const availableMachines = await Machine.count({ where: { is_deleted: false, status: 'available' } });
    const rentedMachines = await Machine.count({ where: { is_deleted: false, status: 'rented_out' } });
    const maintenanceMachines = await Machine.count({ where: { is_deleted: false, status: 'maintenance' } });

    const totalCustomers = await Customer.count({ where: { is_deleted: false } });
    const activeRentalsCount = await Booking.count({ where: { is_deleted: false, status: 'active' } });

    // Calculate current month's revenue
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const monthPayments = await Payment.findAll({
      where: {
        paid_at: { [Op.between]: [firstDay, lastDay] },
        status: 'paid',
      },
      attributes: [[fn('SUM', col('total_amount')), 'total']],
      raw: true,
    });

    const monthlyRevenue = parseFloat((monthPayments[0] as any)?.total || 0);

    // Pending payments
    const pendingBookings = await Booking.findAll({
      where: {
        status: { [Op.in]: ['active', 'completed'] },
        remaining_balance: { [Op.gt]: 0 },
        is_deleted: false,
      },
      attributes: [[fn('SUM', col('remaining_balance')), 'pending']],
      raw: true,
    });

    const pendingTotal = parseFloat((pendingBookings[0] as any)?.pending || 0);

    return {
      total_machines: totalMachines,
      available_machines: availableMachines,
      rented_machines: rentedMachines,
      maintenance_machines: maintenanceMachines,
      total_customers: totalCustomers,
      active_rentals_count: activeRentalsCount,
      monthly_revenue: monthlyRevenue,
      pending_payments_total: pendingTotal,
    };
  }

  async getRecentBookings(limit = 5): Promise<Booking[]> {
    return await Booking.findAll({
      where: { is_deleted: false },
      limit,
      order: [['created_at', 'DESC']],
      include: [
        { model: Customer, as: 'customer', attributes: ['id', 'name', 'phone', 'company_name'] },
        { model: Machine, as: 'machine', attributes: ['id', 'name', 'model', 'registration_number'] },
      ],
    });
  }
}

export default new DashboardService();
