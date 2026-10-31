import { Op } from 'sequelize';
import Operator from '../models/operator.model';
import Machine from '../models/machine.model';
import Booking from '../models/booking.model';
import { CreateOperatorInput, UpdateOperatorInput, OperatorQueryFilter, OperatorStatus } from '../interface/operator.interface';

export class OperatorService {
  async createOperator(input: CreateOperatorInput): Promise<Operator> {
    const existing = await Operator.findOne({
      where: { phone: input.phone, is_deleted: false },
    });
    if (existing) {
      throw new Error(`Operator with phone ${input.phone} already exists`);
    }

    return await Operator.create({
      name: input.name,
      phone: input.phone,
      email: input.email || null,
      license_number: input.license_number || null,
      status: input.status || 'available',
      assigned_machine_id: input.assigned_machine_id || null,
      document_url: input.document_url || null,
      is_active: true,
      is_deleted: false,
    });
  }

  async getAllOperators(filters: OperatorQueryFilter): Promise<{ operators: Operator[]; total: number }> {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(filters.limit) || 10));
    const offset = (page - 1) * limit;

    const where: any = { is_deleted: false };

    if (filters.search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${filters.search}%` } },
        { phone: { [Op.like]: `%${filters.search}%` } },
        { license_number: { [Op.like]: `%${filters.search}%` } },
      ];
    }

    if (filters.status) {
      where.status = filters.status;
    }

    const { rows, count } = await Operator.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [{ model: Machine, as: 'assigned_machine', required: false }],
    });

    return { operators: rows, total: count };
  }

  async getOperatorById(operatorId: string): Promise<Operator> {
    const operator = await Operator.findOne({
      where: { id: operatorId, is_deleted: false },
      include: [
        { model: Machine, as: 'assigned_machine', required: false },
        {
          model: Booking,
          as: 'bookings',
          required: false,
          where: { is_deleted: false },
          limit: 10,
          order: [['created_at', 'DESC']],
        },
      ],
    });

    if (!operator) {
      throw new Error('Operator not found');
    }

    return operator;
  }

  async updateOperator(operatorId: string, input: UpdateOperatorInput): Promise<Operator> {
    const operator = await Operator.findOne({
      where: { id: operatorId, is_deleted: false },
    });
    if (!operator) {
      throw new Error('Operator not found');
    }

    if (input.phone && input.phone !== operator.phone) {
      const existing = await Operator.findOne({
        where: { phone: input.phone, is_deleted: false, id: { [Op.ne]: operatorId } },
      });
      if (existing) {
        throw new Error('Phone number is already registered to another operator');
      }
      operator.phone = input.phone;
    }

    if (input.name) operator.name = input.name;
    if (input.email !== undefined) operator.email = input.email || null;
    if (input.license_number !== undefined) operator.license_number = input.license_number || null;
    if (input.status) operator.status = input.status;
    if (input.assigned_machine_id !== undefined) operator.assigned_machine_id = input.assigned_machine_id;
    if (input.document_url !== undefined) operator.document_url = input.document_url;
    if (input.is_active !== undefined) operator.is_active = input.is_active;

    await operator.save();
    return operator;
  }

  async updateOperatorStatus(operatorId: string, status: OperatorStatus): Promise<Operator> {
    const operator = await Operator.findOne({
      where: { id: operatorId, is_deleted: false },
    });
    if (!operator) {
      throw new Error('Operator not found');
    }

    operator.status = status;
    await operator.save();
    return operator;
  }

  async deleteOperator(operatorId: string): Promise<{ success: boolean; message: string }> {
    const operator = await Operator.findOne({
      where: { id: operatorId, is_deleted: false },
    });
    if (!operator) {
      throw new Error('Operator not found');
    }

    operator.is_deleted = true;
    await operator.save();

    return { success: true, message: 'Operator soft deleted successfully' };
  }

  async getAvailableOperators(): Promise<Operator[]> {
    return await Operator.findAll({
      where: { status: 'available', is_active: true, is_deleted: false },
      include: [{ model: Machine, as: 'assigned_machine', required: false }],
    });
  }
}

export default new OperatorService();
