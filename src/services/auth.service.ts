import { Op } from 'sequelize';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import Customer from '../models/customer.model';
import UserSetting from '../models/user-setting.model';
import envConfig from '../config/env.config';
import { hashPassword, comparePassword } from '../utils/password.util';
import { LoginInput, SignupInput, ForgotPasswordInput, ResetPasswordInput, AuthResponseDto } from '../interface/auth.interface';

export class AuthService {
  async login(input: LoginInput): Promise<AuthResponseDto> {
    const { identifier, password } = input;

    // 1. Try finding in Users (Admins/Managers)
    const user = await User.scope('withPassword').findOne({
      where: {
        [Op.or]: [{ email: identifier }, { phone: identifier }],
        is_deleted: false,
      },
      include: [{ model: UserSetting, as: 'settings' }],
    });

    if (user) {
      if (!user.is_active) {
        throw new Error('Your account is deactivated. Contact administrator.');
      }
      const isMatch = await comparePassword(password, user.password_hash);
      if (!isMatch) {
        throw new Error('Invalid email/phone or password');
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          phone: user.phone,
          role: user.role,
          name: user.name,
        },
        envConfig.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      };
    }

    // 2. Try finding in Customer portal
    const customer = await Customer.findOne({
      where: {
        [Op.or]: [{ email: identifier }, { phone: identifier }],
        is_deleted: false,
      },
    });

    if (customer && customer.password_hash) {
      if (!customer.is_active) {
        throw new Error('Your customer account is deactivated.');
      }
      const isMatch = await comparePassword(password, customer.password_hash);
      if (!isMatch) {
        throw new Error('Invalid email/phone or password');
      }

      const token = jwt.sign(
        {
          id: customer.id,
          email: customer.email || undefined,
          phone: customer.phone,
          role: 'customer',
          name: customer.name,
        },
        envConfig.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return {
        token,
        user: {
          id: customer.id,
          name: customer.name,
          email: customer.email || '',
          phone: customer.phone,
          role: 'customer',
        },
      };
    }

    throw new Error('Invalid email/phone or password');
  }

  async signup(input: SignupInput): Promise<AuthResponseDto> {
    const { name, phone, email, password, role = 'admin', admin_key, company } = input;

    // Check existing
    const existing = await User.findOne({
      where: {
        [Op.or]: [{ email }, { phone }],
        is_deleted: false,
      },
    });
    if (existing) {
      throw new Error('A user with this email or phone already exists');
    }

    // Protect admin signup if key is required
    if (admin_key && admin_key !== envConfig.ADMIN_REGISTRATION_KEY) {
      throw new Error('Invalid admin registration key');
    }

    const password_hash = await hashPassword(password);

    const newUser = await User.create({
      name,
      phone,
      email,
      password_hash,
      role: role as 'admin' | 'manager',
      company: company || null,
      address: null,
      is_active: true,
      is_deleted: false,
    });

    // Create default settings
    await UserSetting.create({
      user_id: newUser.id,
      default_hourly_rate: 1200.0,
      default_daily_rate: 9500.0,
      push_notifications: true,
      company_name: company || 'JCB Fleet Master',
    });

    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        name: newUser.name,
      },
      envConfig.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
    };
  }

  async forgotPassword(input: ForgotPasswordInput): Promise<{ message: string }> {
    const { identifier } = input;
    const user = await User.findOne({
      where: {
        [Op.or]: [{ email: identifier }, { phone: identifier }],
        is_deleted: false,
      },
    });

    if (!user) {
      // Also check customer
      const customer = await Customer.findOne({
        where: {
          [Op.or]: [{ email: identifier }, { phone: identifier }],
          is_deleted: false,
        },
      });
      if (!customer) {
        throw new Error('No account found with provided email or phone');
      }
    }

    // In a live system, send OTP or email reset link
    return {
      message: `Password reset verification sent successfully to ${identifier}`,
    };
  }

  async resetPassword(input: ResetPasswordInput): Promise<{ message: string }> {
    const { identifier, new_password } = input;
    const newHash = await hashPassword(new_password);

    const user = await User.scope('withPassword').findOne({
      where: {
        [Op.or]: [{ email: identifier }, { phone: identifier }],
        is_deleted: false,
      },
    });

    if (user) {
      user.password_hash = newHash;
      await user.save();
      return { message: 'Password has been successfully updated' };
    }

    const customer = await Customer.findOne({
      where: {
        [Op.or]: [{ email: identifier }, { phone: identifier }],
        is_deleted: false,
      },
    });

    if (customer) {
      customer.password_hash = newHash;
      await customer.save();
      return { message: 'Password has been successfully updated' };
    }

    throw new Error('Account not found');
  }

  async getMe(userId: string): Promise<User> {
    const user = await User.findOne({
      where: { id: userId, is_deleted: false },
      include: [{ model: UserSetting, as: 'settings' }],
    });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
}

export default new AuthService();
