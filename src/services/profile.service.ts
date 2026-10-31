import User from '../models/user.model';
import UserSetting from '../models/user-setting.model';
import { UpdateProfileInput, ChangePasswordInput } from '../interface/profile.interface';
import { hashPassword, comparePassword } from '../utils/password.util';

export class ProfileService {
  async getProfile(userId: string): Promise<User> {
    const user = await User.findOne({
      where: { id: userId, is_deleted: false },
      include: [{ model: UserSetting, as: 'settings' }],
    });
    if (!user) {
      throw new Error('User profile not found');
    }
    return user;
  }

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<User> {
    const user = await User.findOne({
      where: { id: userId, is_deleted: false },
      include: [{ model: UserSetting, as: 'settings' }],
    });
    if (!user) {
      throw new Error('User not found');
    }

    if (input.name) user.name = input.name;
    if (input.phone) user.phone = input.phone;
    if (input.company !== undefined) user.company = input.company || null;
    if (input.address !== undefined) user.address = input.address || null;
    await user.save();

    let settings = await UserSetting.findOne({ where: { user_id: userId } });
    if (!settings) {
      settings = await UserSetting.create({
        user_id: userId,
        default_hourly_rate: input.default_hourly_rate || 1200,
        default_daily_rate: input.default_daily_rate || 9500,
        push_notifications: input.push_notifications !== undefined ? input.push_notifications : true,
        company_name: input.company || 'JCB Fleet Master',
      });
    } else {
      if (input.default_hourly_rate !== undefined) settings.default_hourly_rate = input.default_hourly_rate;
      if (input.default_daily_rate !== undefined) settings.default_daily_rate = input.default_daily_rate;
      if (input.push_notifications !== undefined) settings.push_notifications = input.push_notifications;
      if (input.company !== undefined) settings.company_name = input.company || null;
      await settings.save();
    }

    return await this.getProfile(userId);
  }

  async changePassword(userId: string, input: ChangePasswordInput): Promise<{ message: string }> {
    const user = await User.scope('withPassword').findOne({
      where: { id: userId, is_deleted: false },
    });
    if (!user) {
      throw new Error('User not found');
    }

    const isMatch = await comparePassword(input.current_password, user.password_hash);
    if (!isMatch) {
      throw new Error('Current password is incorrect');
    }

    user.password_hash = await hashPassword(input.new_password);
    await user.save();

    return { message: 'Password changed successfully' };
  }
}

export default new ProfileService();
