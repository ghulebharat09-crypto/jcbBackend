import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import envConfig from '../config/env.config';
import { sendError } from '../utils/response.util';

export interface AuthUserPayload {
  id: string;
  email?: string;
  phone?: string;
  role: 'admin' | 'manager' | 'customer';
  name?: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUserPayload;
  }
}

export const authenticateToken = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(reply, 'Authorization token is required (Bearer <token>)', 401);
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, envConfig.JWT_SECRET) as AuthUserPayload;

    request.user = decoded;
  } catch (error: any) {
    sendError(reply, 'Invalid or expired token', 401, error.message);
  }
};
