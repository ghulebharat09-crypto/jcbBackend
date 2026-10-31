import { FastifyRequest, FastifyReply } from 'fastify';
import authService from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/response.util';
import { LoginInput, SignupInput, ForgotPasswordInput, ResetPasswordInput } from '../interface/auth.interface';

export class AuthController {
  async login(request: FastifyRequest<{ Body: LoginInput }>, reply: FastifyReply) {
    try {
      const result = await authService.login(request.body);
      return sendSuccess(reply, 'Login successful', result);
    } catch (error: any) {
      return sendError(reply, error.message || 'Login failed', 400);
    }
  }

  async signup(request: FastifyRequest<{ Body: SignupInput }>, reply: FastifyReply) {
    try {
      const result = await authService.signup(request.body);
      return sendSuccess(reply, 'Account registered successfully', result, 201);
    } catch (error: any) {
      return sendError(reply, error.message || 'Signup failed', 400);
    }
  }

  async forgotPassword(request: FastifyRequest<{ Body: ForgotPasswordInput }>, reply: FastifyReply) {
    try {
      const result = await authService.forgotPassword(request.body);
      return sendSuccess(reply, result.message);
    } catch (error: any) {
      return sendError(reply, error.message || 'Forgot password failed', 400);
    }
  }

  async resetPassword(request: FastifyRequest<{ Body: ResetPasswordInput }>, reply: FastifyReply) {
    try {
      const result = await authService.resetPassword(request.body);
      return sendSuccess(reply, result.message);
    } catch (error: any) {
      return sendError(reply, error.message || 'Reset password failed', 400);
    }
  }

  async getMe(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        return sendError(reply, 'Unauthorized', 401);
      }
      const user = await authService.getMe(request.user.id);
      return sendSuccess(reply, 'Profile retrieved', user);
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to fetch user', 400);
    }
  }
}

export default new AuthController();
