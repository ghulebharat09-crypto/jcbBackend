import { FastifyRequest, FastifyReply } from 'fastify';
import { sendError } from '../utils/response.util';

export const requireRole = (allowedRoles: string[]) => {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (!request.user) {
      sendError(reply, 'User is not authenticated', 401);
      return;
    }

    if (!allowedRoles.includes(request.user.role)) {
      sendError(
        reply,
        `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]`,
        403
      );
      return;
    }
  };
};

export const requireAdmin = requireRole(['admin']);
