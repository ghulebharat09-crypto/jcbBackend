import { Op } from 'sequelize';
import Machine from '../models/machine.model';
import Booking from '../models/booking.model';
import MaintenanceRecord from '../models/maintenance.model';
import Operator from '../models/operator.model';
import { CreateMachineInput, UpdateMachineInput, MachineQueryFilter, MachineStatus } from '../interface/machine.interface';

export class MachineService {
  async createMachine(input: CreateMachineInput): Promise<Machine> {
    const existing = await Machine.findOne({
      where: { registration_number: input.registration_number, is_deleted: false },
    });
    if (existing) {
      throw new Error(`Machine with registration ${input.registration_number} already exists`);
    }

    return await Machine.create({
      name: input.name,
      model: input.model,
      registration_number: input.registration_number,
      machine_type: input.machine_type,
      status: input.status || 'available',
      hourly_rate: input.hourly_rate,
      daily_rate: input.daily_rate,
      base_yard_location: input.base_yard_location,
      image_url: input.image_url || null,
      is_active: true,
      is_deleted: false,
    });
  }

  async getAllMachines(filters: MachineQueryFilter): Promise<{ machines: Machine[]; total: number }> {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(filters.limit) || 10));
    const offset = (page - 1) * limit;

    const where: any = { is_deleted: false };

    if (filters.search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${filters.search}%` } },
        { model: { [Op.like]: `%${filters.search}%` } },
        { registration_number: { [Op.like]: `%${filters.search}%` } },
        { machine_type: { [Op.like]: `%${filters.search}%` } },
      ];
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.machine_type) {
      where.machine_type = filters.machine_type;
    }

    const { rows, count } = await Machine.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [
        { model: Operator, as: 'operators', required: false, where: { is_deleted: false } },
      ],
    });

    return { machines: rows, total: count };
  }

  async getMachineById(machineId: string): Promise<Machine> {
    const machine = await Machine.findOne({
      where: { id: machineId, is_deleted: false },
      include: [
        { model: Operator, as: 'operators', required: false, where: { is_deleted: false } },
        {
          model: Booking,
          as: 'bookings',
          required: false,
          where: { is_deleted: false },
          limit: 10,
          order: [['created_at', 'DESC']],
        },
        {
          model: MaintenanceRecord,
          as: 'maintenance_records',
          required: false,
          where: { is_deleted: false },
          limit: 10,
          order: [['service_date', 'DESC']],
        },
      ],
    });

    if (!machine) {
      throw new Error('Machine not found');
    }

    return machine;
  }

  async updateMachine(machineId: string, input: UpdateMachineInput): Promise<Machine> {
    const machine = await Machine.findOne({
      where: { id: machineId, is_deleted: false },
    });
    if (!machine) {
      throw new Error('Machine not found');
    }

    if (input.registration_number && input.registration_number !== machine.registration_number) {
      const existing = await Machine.findOne({
        where: {
          registration_number: input.registration_number,
          is_deleted: false,
          id: { [Op.ne]: machineId },
        },
      });
      if (existing) {
        throw new Error('Registration number is already assigned to another machine');
      }
      machine.registration_number = input.registration_number;
    }

    if (input.name) machine.name = input.name;
    if (input.model) machine.model = input.model;
    if (input.machine_type) machine.machine_type = input.machine_type;
    if (input.status) machine.status = input.status;
    if (input.hourly_rate !== undefined) machine.hourly_rate = input.hourly_rate;
    if (input.daily_rate !== undefined) machine.daily_rate = input.daily_rate;
    if (input.base_yard_location) machine.base_yard_location = input.base_yard_location;
    if (input.image_url !== undefined) machine.image_url = input.image_url;
    if (input.is_active !== undefined) machine.is_active = input.is_active;

    await machine.save();
    return machine;
  }

  async updateMachineStatus(machineId: string, status: MachineStatus): Promise<Machine> {
    const machine = await Machine.findOne({
      where: { id: machineId, is_deleted: false },
    });
    if (!machine) {
      throw new Error('Machine not found');
    }

    machine.status = status;
    await machine.save();
    return machine;
  }

  async deleteMachine(machineId: string): Promise<{ success: boolean; message: string }> {
    const machine = await Machine.findOne({
      where: { id: machineId, is_deleted: false },
    });
    if (!machine) {
      throw new Error('Machine not found');
    }

    machine.is_deleted = true;
    await machine.save();

    return { success: true, message: 'Machine soft deleted successfully' };
  }

  async checkAvailability(startDate: string, endDate: string, machineId?: string): Promise<Machine[]> {
    // Find machines that have conflicting bookings in the date range
    const conflictBookings = await Booking.findAll({
      where: {
        status: { [Op.in]: ['scheduled', 'active'] },
        is_deleted: false,
        [Op.or]: [
          {
            start_date: { [Op.between]: [startDate, endDate] },
          },
          {
            end_date: { [Op.between]: [startDate, endDate] },
          },
          {
            [Op.and]: [
              { start_date: { [Op.lte]: startDate } },
              { end_date: { [Op.gte]: endDate } },
            ],
          },
        ],
      },
      attributes: ['machine_id'],
    });

    const bookedMachineIds = conflictBookings.map((b) => b.machine_id);

    const where: any = {
      is_deleted: false,
      is_active: true,
      status: { [Op.ne]: 'maintenance' },
      id: { [Op.notIn]: bookedMachineIds },
    };

    if (machineId) {
      where.id = machineId;
    }

    return await Machine.findAll({ where });
  }
}

export default new MachineService();
