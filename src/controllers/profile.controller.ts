import { FastifyRequest, FastifyReply } from 'fastify';
import profileService from '../services/profile.service';
import { sendSuccess, sendError } from '../utils/response.util';
import { UpdateProfileInput, ChangePasswordInput } from '../interface/profile.interface';

export class ProfileController {
  async getProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        return sendError(reply, 'Unauthorized', 401);
      }
      const profile = await profileService.getProfile(request.user.id);
      return sendSuccess(reply, 'User profile retrieved successfully', profile);
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to retrieve profile', 400);
    }
  }

  async updateProfile(request: FastifyRequest<{ Body: UpdateProfileInput }>, reply: FastifyReply) {
    try {
      if (!request.user) {
        return sendError(reply, 'Unauthorized', 401);
      }
      const updated = await profileService.updateProfile(request.user.id, request.body);
      return sendSuccess(reply, 'Profile updated successfully', updated);
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to update profile', 400);
    }
  }

  async changePassword(request: FastifyRequest<{ Body: ChangePasswordInput }>, reply: FastifyReply) {
    try {
      if (!request.user) {
        return sendError(reply, 'Unauthorized', 401);
      }
      const result = await profileService.changePassword(request.user.id, request.body);
      return sendSuccess(reply, result.message);
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to change password', 400);
    }
  }
}

export default new ProfileController();
