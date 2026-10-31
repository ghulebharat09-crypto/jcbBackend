import { FastifyInstance } from 'fastify';
import operatorController from '../controllers/operator.controller';
import { authenticateToken } from '../middleware/auth.middleware';

export default async function operatorRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.addHook('preHandler', authenticateToken);

  fastify.post('/create-operator', operatorController.createOperator.bind(operatorController));
  fastify.get('/getAll-operator', operatorController.getAllOperators.bind(operatorController));
  fastify.get('/available-operators', operatorController.getAvailableOperators.bind(operatorController));
  fastify.get('/operator/:operator_id', operatorController.getOperatorById.bind(operatorController));
  fastify.put('/operator/:operator_id/update-operator', operatorController.updateOperator.bind(operatorController));
  fastify.patch('/operator/:operator_id/update-status', operatorController.updateOperatorStatus.bind(operatorController));
  fastify.delete('/operator/:operator_id/delete-operator', operatorController.deleteOperator.bind(operatorController));
  fastify.post('/operator/:operator_id/upload-document', operatorController.uploadOperatorDocument.bind(operatorController));
}
