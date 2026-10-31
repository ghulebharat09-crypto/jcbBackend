import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import { MachineAttributes, MachineStatus } from '../interface/machine.interface';
import convertEmptyStringToNull from '../db/hooks/convert-empty-string-to-null';

export type MachineCreationAttributes = Optional<
  MachineAttributes,
  'id' | 'status' | 'image_url' | 'is_active' | 'is_deleted' | 'created_at' | 'updated_at'
>;

export class Machine
  extends Model<MachineAttributes, MachineCreationAttributes>
  implements MachineAttributes
{
  public id!: string;
  public name!: string;
  public model!: string;
  public registration_number!: string;
  public machine_type!: string;
  public status!: MachineStatus;
  public hourly_rate!: number;
  public daily_rate!: number;
  public base_yard_location!: string;
  public image_url!: string | null;
  public is_active!: boolean;
  public is_deleted!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public static initialize(sequelize: Sequelize): typeof Machine {
    Machine.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        model: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        registration_number: {
          type: DataTypes.STRING(50),
          allowNull: false,
          unique: true,
        },
        machine_type: {
          type: DataTypes.STRING(50),
          allowNull: false,
        },
        status: {
          type: DataTypes.ENUM('available', 'rented_out', 'maintenance'),
          defaultValue: 'available',
          allowNull: false,
        },
        hourly_rate: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          get() {
            const raw = this.getDataValue('hourly_rate');
            return raw ? parseFloat(raw as any) : 0;
          },
        },
        daily_rate: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          get() {
            const raw = this.getDataValue('daily_rate');
            return raw ? parseFloat(raw as any) : 0;
          },
        },
        base_yard_location: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        image_url: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        is_active: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
          allowNull: false,
        },
        is_deleted: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 'machines',
        modelName: 'Machine',
        underscored: true,
        hooks: {
          beforeValidate: (machine) => {
            convertEmptyStringToNull(machine);
          },
        },
      }
    );

    return Machine;
  }
}

export default Machine;
