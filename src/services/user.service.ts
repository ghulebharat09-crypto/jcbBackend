import { Op } from 'sequelize';
import User from '../models/user.model';
import UserSetting from '../models/user-setting.model';
import { CreateUserInput, UpdateUserInput } from '../interface/user.interface';
import { hashPassword } from '../utils/password.util';

export class UserService {
  async getAllUsers(): Promise<User[]> {
    return await User.findAll({
      where: { is_deleted: false },
      include: [{ model: UserSetting, as: 'settings' }],
      order: [['created_at', 'DESC']],
    });
  }

  async getUserById(userId: string): Promise<User> {
    const user = await User.findOne({
      where: { id: userId, is_deleted: false },
      include: [{ model: UserSetting, as: 'settings' }],
    });
    if (!user) throw new Error('User not found');
    return user;
  }

  async createUser(input: CreateUserInput): Promise<User> {
    const existing = await User.findOne({
      where: {
        [Op.or]: [{ email: input.email }, { phone: input.phone }],
        is_deleted: false,
      },
    });
    if (existing) {
      throw new Error('User with this email or phone already exists');
    }

    const password_hash = await hashPassword(input.password);
    const user = await User.create({
      name: input.name,
      phone: input.phone,
      email: input.email,
      password_hash,
      role: input.role || 'manager',
      company: input.company || null,
      address: input.address || null,
      is_active: true,
      is_deleted: false,
    });

    await UserSetting.create({
      user_id: user.id,
      default_hourly_rate: 1200.0,
      default_daily_rate: 9500.0,
      push_notifications: true,
      company_name: input.company || null,
    });

    return await this.getUserById(user.id);
  }

  async updateUser(userId: string, input: UpdateUserInput): Promise<User> {
    const user = await User.findOne({ where: { id: userId, is_deleted: false } });
    if (!user) throw new Error('User not found');

    if (input.name) user.name = input.name;
    if (input.phone) user.phone = input.phone;
    if (input.email) user.email = input.email;
    if (input.company !== undefined) user.company = input.company || null;
    if (input.address !== undefined) user.address = input.address || null;
    if (input.is_active !== undefined) user.is_active = input.is_active;

    await user.save();
    return await this.getUserById(user.id);
  }

  async deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
    const user = await User.findOne({ where: { id: userId, is_deleted: false } });
    if (!user) throw new Error('User not found');

    user.is_deleted = true;
    await user.save();
    return { success: true, message: 'User soft deleted successfully' };
  }
}

export default new UserService();
