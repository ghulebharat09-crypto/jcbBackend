import { FastifyReply } from 'fastify';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    [key: string]: any;
  };
  error?: string | any;
}

export const sendSuccess = <T>(
  reply: FastifyReply,
  message: string,
  data?: T,
  statusCode = 200,
  meta?: ApiResponse['meta']
): FastifyReply => {
  return reply.status(statusCode).send({
    success: true,
    message,
    data,
    meta,
  });
};

export const sendError = (
  reply: FastifyReply,
  message: string,
  statusCode = 500,
  error?: any
): FastifyReply => {
  return reply.status(statusCode).send({
    success: false,
    message,
    error: error instanceof Error ? error.message : error || message,
  });
};

export const sendPaginated = <T>(
  reply: FastifyReply,
  message: string,
  items: T[],
  total: number,
  page: number,
  limit: number
): FastifyReply => {
  const totalPages = Math.ceil(total / limit);
  return reply.status(200).send({
    success: true,
    message,
    data: items,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
};
