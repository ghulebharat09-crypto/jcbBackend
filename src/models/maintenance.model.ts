import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import { MaintenanceAttributes, ServiceType } from '../interface/maintenance.interface';
import convertEmptyStringToNull from '../db/hooks/convert-empty-string-to-null';

export type MaintenanceCreationAttributes = Optional<
  MaintenanceAttributes,
  'id' | 'service_detail' | 'performed_by' | 'next_service_date' | 'is_deleted' | 'created_at' | 'updated_at'
>;

export class MaintenanceRecord
  extends Model<MaintenanceAttributes, MaintenanceCreationAttributes>
  implements MaintenanceAttributes
{
  public id!: string;
  public machine_id!: string;
  public service_title!: string;
  public service_detail!: string | null;
  public service_type!: ServiceType;
  public service_date!: Date | string;
  public cost!: number;
  public performed_by!: string | null;
  public next_service_date!: Date | string | null;
  public is_deleted!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public static initialize(sequelize: Sequelize): typeof MaintenanceRecord {
    MaintenanceRecord.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        machine_id: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        service_title: {
          type: DataTypes.STRING(150),
          allowNull: false,
        },
        service_detail: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        service_type: {
          type: DataTypes.ENUM(
            'oil_change',
            'filter',
            'major_service',
            'fuel',
            'tyres',
            'hydraulic',
            'other'
          ),
          defaultValue: 'other',
          allowNull: false,
        },
        service_date: {
          type: DataTypes.DATEONLY,
          allowNull: false,
        },
        cost: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          get() {
            const raw = this.getDataValue('cost');
            return raw ? parseFloat(raw as any) : 0;
          },
        },
        performed_by: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        next_service_date: {
          type: DataTypes.DATEONLY,
          allowNull: true,
        },
        is_deleted: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 'maintenance_records',
        modelName: 'MaintenanceRecord',
        underscored: true,
        hooks: {
          beforeValidate: (record) => {
            convertEmptyStringToNull(record);
          },
        },
      }
    );

    return MaintenanceRecord;
  }
}

export default MaintenanceRecord;
