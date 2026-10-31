import User from '../src/models/user.model';
import UserSetting from '../src/models/user-setting.model';
import Machine from '../src/models/machine.model';
import Customer from '../src/models/customer.model';
import Operator from '../src/models/operator.model';
import { hashPassword } from '../src/utils/password.util';
import { sequelize } from '../src/plugins/sequelize-plugin';
import { initializeModels } from '../src/plugins/modelinitializer-plugin';

export const seedDatabase = async () => {
  try {
    initializeModels(sequelize);
    await sequelize.authenticate();

    // 1. Seed Admin
    const adminEmail = 'admin@jcbfleet.com';
    const existingAdmin = await User.findOne({ where: { email: adminEmail } });

    if (!existingAdmin) {
      const passwordHash = await hashPassword('Admin@123');
      const admin = await User.create({
        name: 'Fleet Administrator',
        phone: '9876543210',
        email: adminEmail,
        password_hash: passwordHash,
        role: 'admin',
        company: 'JCB Fleet Master HQ',
        address: 'Pune Yard 1, Maharashtra, India',
        is_active: true,
        is_deleted: false,
      });

      await UserSetting.create({
        user_id: admin.id,
        default_hourly_rate: 1200.0,
        default_daily_rate: 9500.0,
        push_notifications: true,
        company_name: 'JCB Fleet Master Services',
        company_address: 'Pune Yard 1, Maharashtra',
        gst_number: '27AABCU9603R1ZX',
      });

      console.log('✅ Admin user seeded: admin@jcbfleet.com / Admin@123');
    }

    // 2. Seed Sample Machine
    const machineReg = 'MH-12-JC-4821';
    const existingMachine = await Machine.findOne({ where: { registration_number: machineReg } });
    if (!existingMachine) {
      await Machine.create({
        name: 'JCB 3CX Eco Backhoe Loader',
        model: '3CX Eco 2024',
        registration_number: machineReg,
        machine_type: 'Backhoe Loader',
        status: 'available',
        hourly_rate: 1200.0,
        daily_rate: 9500.0,
        base_yard_location: 'Central Pune Yard',
        is_active: true,
        is_deleted: false,
      });
      console.log('✅ Sample machine seeded: JCB 3CX Eco (MH-12-JC-4821)');
    }

    // 3. Seed Sample Operator
    const operatorPhone = '9822001122';
    const existingOp = await Operator.findOne({ where: { phone: operatorPhone } });
    if (!existingOp) {
      await Operator.create({
        name: 'Ramesh Pawar',
        phone: operatorPhone,
        email: 'ramesh.pawar@operators.com',
        license_number: 'MH-14-2018-00987',
        status: 'available',
        is_active: true,
        is_deleted: false,
      });
      console.log('✅ Sample operator seeded: Ramesh Pawar');
    }

    // 4. Seed Sample Customer
    const customerPhone = '9890123456';
    const existingCust = await Customer.findOne({ where: { phone: customerPhone } });
    if (!existingCust) {
      const custHash = await hashPassword('Customer@123');
      await Customer.create({
        name: 'Shree Ganesh Infra Ltd',
        company_name: 'Shree Ganesh Infra Ltd',
        phone: customerPhone,
        email: 'infra@ganesh.com',
        password_hash: custHash,
        address: 'Bavdhan, Pune, MH',
        customer_type: 'corporate',
        is_active: true,
        is_deleted: false,
      });
      console.log('✅ Sample customer seeded: Shree Ganesh Infra Ltd');
    }

    console.log('🌱 Seeding completed successfully.');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  }
};

if (require.main === module) {
  seedDatabase().then(() => process.exit(0));
}

export default seedDatabase;
