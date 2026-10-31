import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { Sequelize } from 'sequelize';
import { sequelize as fallbackSequelize } from './sequelize-plugin';
import User from '../models/user.model';
import Customer from '../models/customer.model';
import Machine from '../models/machine.model';
import Operator from '../models/operator.model';
import Booking from '../models/booking.model';
import MaintenanceRecord from '../models/maintenance.model';
import Payment from '../models/payment.model';
import Invoice from '../models/invoice.model';
import InvoiceItem from '../models/invoice-item.model';
import OperatorAssignment from '../models/operator-assignment.model';
import UserSetting from '../models/user-setting.model';

export const initializeModels = (sequelize: Sequelize) => {
  // 1. Initialize models
  User.initialize(sequelize);
  Customer.initialize(sequelize);
  Machine.initialize(sequelize);
  Operator.initialize(sequelize);
  Booking.initialize(sequelize);
  MaintenanceRecord.initialize(sequelize);
  Payment.initialize(sequelize);
  Invoice.initialize(sequelize);
  InvoiceItem.initialize(sequelize);
  OperatorAssignment.initialize(sequelize);
  UserSetting.initialize(sequelize);

  // 2. Setup Associations

  // User <-> UserSetting (1:1)
  User.hasOne(UserSetting, { foreignKey: 'user_id', as: 'settings' });
  UserSetting.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // Machine <-> Operator (assigned default machine)
  Machine.hasMany(Operator, { foreignKey: 'assigned_machine_id', as: 'operators' });
  Operator.belongsTo(Machine, { foreignKey: 'assigned_machine_id', as: 'assigned_machine' });

  // Customer <-> Booking (1:N)
  Customer.hasMany(Booking, { foreignKey: 'customer_id', as: 'bookings' });
  Booking.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });

  // Machine <-> Booking (1:N)
  Machine.hasMany(Booking, { foreignKey: 'machine_id', as: 'bookings' });
  Booking.belongsTo(Machine, { foreignKey: 'machine_id', as: 'machine' });

  // Operator <-> Booking (1:N)
  Operator.hasMany(Booking, { foreignKey: 'operator_id', as: 'bookings' });
  Booking.belongsTo(Operator, { foreignKey: 'operator_id', as: 'operator' });

  // Machine <-> MaintenanceRecord (1:N)
  Machine.hasMany(MaintenanceRecord, { foreignKey: 'machine_id', as: 'maintenance_records' });
  MaintenanceRecord.belongsTo(Machine, { foreignKey: 'machine_id', as: 'machine' });

  // Booking <-> Payment (1:N)
  Booking.hasMany(Payment, { foreignKey: 'booking_id', as: 'payments' });
  Payment.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

  // Customer <-> Invoice (1:N)
  Customer.hasMany(Invoice, { foreignKey: 'customer_id', as: 'invoices' });
  Invoice.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });

  // Booking <-> Invoice (1:1)
  Booking.hasOne(Invoice, { foreignKey: 'booking_id', as: 'invoice' });
  Invoice.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

  // Payment <-> Invoice (1:1)
  Payment.hasOne(Invoice, { foreignKey: 'payment_id', as: 'invoice' });
  Invoice.belongsTo(Payment, { foreignKey: 'payment_id', as: 'payment' });

  // Invoice <-> InvoiceItem (1:N)
  Invoice.hasMany(InvoiceItem, { foreignKey: 'invoice_id', as: 'items', onDelete: 'CASCADE' });
  InvoiceItem.belongsTo(Invoice, { foreignKey: 'invoice_id', as: 'invoice' });

  // Booking <-> OperatorAssignment (1:N)
  Booking.hasMany(OperatorAssignment, { foreignKey: 'booking_id', as: 'operator_assignments' });
  OperatorAssignment.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

  // Operator <-> OperatorAssignment (1:N)
  Operator.hasMany(OperatorAssignment, { foreignKey: 'operator_id', as: 'assignments' });
  OperatorAssignment.belongsTo(Operator, { foreignKey: 'operator_id', as: 'operator' });
};

async function modelInitializationPlugin(fastify: FastifyInstance): Promise<void> {
  const sequelize = fastify.sequelize || fallbackSequelize;
  initializeModels(sequelize);
  fastify.log.info('All Sequelize models and associations initialized successfully.');
}

export default fp(modelInitializationPlugin, {
  name: 'model-initializer-plugin',
  dependencies: ['sequelize-plugin'],
});
