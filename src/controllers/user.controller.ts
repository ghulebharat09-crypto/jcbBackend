import { FastifyRequest, FastifyReply } from 'fastify';
import userService from '../services/user.service';
import { sendSuccess, sendError } from '../utils/response.util';
import { CreateUserInput, UpdateUserInput } from '../interface/user.interface';

export class UserController {
  async getAllUsers(request: FastifyRequest, reply: FastifyReply) {
    try {
      const users = await userService.getAllUsers();
      return sendSuccess(reply, 'Users retrieved successfully', users);
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to retrieve users', 500);
    }
  }

  async getUserById(request: FastifyRequest<{ Params: { user_id: string } }>, reply: FastifyReply) {
    try {
      const user = await userService.getUserById(request.params.user_id);
      return sendSuccess(reply, 'User retrieved successfully', user);
    } catch (error: any) {
      return sendError(reply, error.message || 'User not found', 404);
    }
  }

  async createUser(request: FastifyRequest<{ Body: CreateUserInput }>, reply: FastifyReply) {
    try {
      const user = await userService.createUser(request.body);
      return sendSuccess(reply, 'User created successfully', user, 201);
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to create user', 400);
    }
  }

  async updateUser(
    request: FastifyRequest<{ Params: { user_id: string }; Body: UpdateUserInput }>,
    reply: FastifyReply
  ) {
    try {
      const user = await userService.updateUser(request.params.user_id, request.body);
      return sendSuccess(reply, 'User updated successfully', user);
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to update user', 400);
    }
  }

  async deleteUser(request: FastifyRequest<{ Params: { user_id: string } }>, reply: FastifyReply) {
    try {
      const result = await userService.deleteUser(request.params.user_id);
      return sendSuccess(reply, result.message);
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to delete user', 400);
    }
  }
}

export default new UserController();
