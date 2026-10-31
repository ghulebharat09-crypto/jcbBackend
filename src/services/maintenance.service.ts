import { Op, fn, col } from 'sequelize';
import MaintenanceRecord from '../models/maintenance.model';
import Machine from '../models/machine.model';
import { CreateMaintenanceInput, UpdateMaintenanceInput, MaintenanceQueryFilter } from '../interface/maintenance.interface';

export class MaintenanceService {
  async createMaintenance(input: CreateMaintenanceInput): Promise<MaintenanceRecord> {
    const machine = await Machine.findOne({
      where: { id: input.machine_id, is_deleted: false },
    });
    if (!machine) {
      throw new Error('Machine not found');
    }

    const record = await MaintenanceRecord.create({
      machine_id: input.machine_id,
      service_title: input.service_title,
      service_detail: input.service_detail || null,
      service_type: input.service_type,
      service_date: input.service_date,
      cost: input.cost,
      performed_by: input.performed_by || null,
      next_service_date: input.next_service_date || null,
      is_deleted: false,
    });

    // Optionally set machine status to maintenance
    machine.status = 'maintenance';
    await machine.save();

    return record;
  }

  async getAllMaintenance(filters: MaintenanceQueryFilter): Promise<{ records: MaintenanceRecord[]; total: number }> {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(filters.limit) || 10));
    const offset = (page - 1) * limit;

    const where: any = { is_deleted: false };

    if (filters.machine_id) {
      where.machine_id = filters.machine_id;
    }

    if (filters.service_type) {
      where.service_type = filters.service_type;
    }

    if (filters.from_date && filters.to_date) {
      where.service_date = { [Op.between]: [filters.from_date, filters.to_date] };
    }

    const { rows, count } = await MaintenanceRecord.findAndCountAll({
      where,
      limit,
      offset,
      order: [['service_date', 'DESC']],
      include: [{ model: Machine, as: 'machine', attributes: ['id', 'name', 'model', 'registration_number'] }],
    });

    return { records: rows, total: count };
  }

  async getMaintenanceById(maintenanceId: string): Promise<MaintenanceRecord> {
    const record = await MaintenanceRecord.findOne({
      where: { id: maintenanceId, is_deleted: false },
      include: [{ model: Machine, as: 'machine' }],
    });

    if (!record) {
      throw new Error('Maintenance record not found');
    }

    return record;
  }

  async updateMaintenance(maintenanceId: string, input: UpdateMaintenanceInput): Promise<MaintenanceRecord> {
    const record = await MaintenanceRecord.findOne({
      where: { id: maintenanceId, is_deleted: false },
    });
    if (!record) {
      throw new Error('Maintenance record not found');
    }

    if (input.service_title) record.service_title = input.service_title;
    if (input.service_detail !== undefined) record.service_detail = input.service_detail || null;
    if (input.service_type) record.service_type = input.service_type;
    if (input.service_date) record.service_date = input.service_date;
    if (input.cost !== undefined) record.cost = input.cost;
    if (input.performed_by !== undefined) record.performed_by = input.performed_by || null;
    if (input.next_service_date !== undefined) record.next_service_date = input.next_service_date || null;

    await record.save();
    return record;
  }

  async deleteMaintenance(maintenanceId: string): Promise<{ success: boolean; message: string }> {
    const record = await MaintenanceRecord.findOne({
      where: { id: maintenanceId, is_deleted: false },
    });
    if (!record) {
      throw new Error('Maintenance record not found');
    }

    record.is_deleted = true;
    await record.save();

    return { success: true, message: 'Maintenance record soft deleted successfully' };
  }

  async getExpensesSummary(): Promise<any> {
    const breakdown = await MaintenanceRecord.findAll({
      where: { is_deleted: false },
      attributes: [
        'service_type',
        [fn('COUNT', col('id')), 'count'],
        [fn('SUM', col('cost')), 'total_cost'],
      ],
      group: ['service_type'],
      raw: true,
    });

    const totalCost = breakdown.reduce((sum, item: any) => sum + parseFloat(item.total_cost || 0), 0);

    return {
      total_expense: totalCost,
      breakdown,
    };
  }
}

export default new MaintenanceService();
