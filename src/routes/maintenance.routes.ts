import { FastifyInstance } from 'fastify';
import maintenanceController from '../controllers/maintenance.controller';
import { authenticateToken } from '../middleware/auth.middleware';

export default async function maintenanceRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.addHook('preHandler', authenticateToken);

  fastify.post('/create-maintenance', maintenanceController.createMaintenance.bind(maintenanceController));
  fastify.get('/getAll-maintenance', maintenanceController.getAllMaintenance.bind(maintenanceController));
  fastify.get('/expenses-summary', maintenanceController.getExpensesSummary.bind(maintenanceController));
  fastify.get('/maintenance/:maintenance_id', maintenanceController.getMaintenanceById.bind(maintenanceController));
  fastify.put('/maintenance/:maintenance_id/update-maintenance', maintenanceController.updateMaintenance.bind(maintenanceController));
  fastify.delete('/maintenance/:maintenance_id/delete-maintenance', maintenanceController.deleteMaintenance.bind(maintenanceController));
}
