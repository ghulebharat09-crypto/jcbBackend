import { Op, fn, col, literal } from 'sequelize';
import Payment from '../models/payment.model';
import Machine from '../models/machine.model';
import { MonthlyRevenueItem, FleetUtilizationDto } from '../interface/report.interface';

export class ReportService {
  async getRevenueAnalytics(yearTarget?: number): Promise<MonthlyRevenueItem[]> {
    const year = yearTarget || new Date().getFullYear();

    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    const results: MonthlyRevenueItem[] = [];

    for (let m = 0; m < 12; m++) {
      const start = new Date(year, m, 1);
      const end = new Date(year, m + 1, 0, 23, 59, 59);

      const payments = await Payment.findAll({
        where: {
          status: 'paid',
          paid_at: { [Op.between]: [start, end] },
        },
        attributes: [
          [fn('SUM', col('total_amount')), 'revenue'],
          [fn('COUNT', col('id')), 'count'],
        ],
        raw: true,
      });

      const totalRevenue = parseFloat((payments[0] as any)?.revenue || 0);
      const count = parseInt((payments[0] as any)?.count || 0, 10);

      results.push({
        month: monthNames[m],
        year,
        total_revenue: totalRevenue,
        bookings_count: count,
      });
    }

    return results;
  }

  async getFleetUtilization(): Promise<FleetUtilizationDto> {
    const totalFleet = await Machine.count({ where: { is_deleted: false } });
    const rentedCount = await Machine.count({ where: { is_deleted: false, status: 'rented_out' } });
    const availableCount = await Machine.count({ where: { is_deleted: false, status: 'available' } });
    const maintenanceCount = await Machine.count({ where: { is_deleted: false, status: 'maintenance' } });

    const utilization = totalFleet > 0 ? Math.round((rentedCount / totalFleet) * 100) : 0;

    return {
      total_fleet: totalFleet,
      rented_count: rentedCount,
      available_count: availableCount,
      maintenance_count: maintenanceCount,
      utilization_percentage: utilization,
    };
  }
}

export default new ReportService();
