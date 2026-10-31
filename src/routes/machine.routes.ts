import { FastifyInstance } from 'fastify';
import machineController from '../controllers/machine.controller';
import { authenticateToken } from '../middleware/auth.middleware';

export default async function machineRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.addHook('preHandler', authenticateToken);

  fastify.post('/create-machine', machineController.createMachine.bind(machineController));
  fastify.get('/getAll-machine', machineController.getAllMachines.bind(machineController));
  fastify.get('/check-availability', machineController.checkAvailability.bind(machineController));
  fastify.get('/machine/:machine_id', machineController.getMachineById.bind(machineController));
  fastify.put('/machine/:machine_id/update-machine', machineController.updateMachine.bind(machineController));
  fastify.patch('/machine/:machine_id/update-status', machineController.updateMachineStatus.bind(machineController));
  fastify.delete('/machine/:machine_id/delete-machine', machineController.deleteMachine.bind(machineController));
  fastify.post('/machine/:machine_id/upload-image', machineController.uploadMachineImage.bind(machineController));
}
