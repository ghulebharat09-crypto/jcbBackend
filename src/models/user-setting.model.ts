import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface UserSettingAttributes {
  id: string;
  user_id: string;
  default_hourly_rate: number;
  default_daily_rate: number;
  push_notifications: boolean;
  company_name?: string | null;
  company_address?: string | null;
  gst_number?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export type UserSettingCreationAttributes = Optional<
  UserSettingAttributes,
  'id' | 'default_hourly_rate' | 'default_daily_rate' | 'push_notifications' | 'company_name' | 'company_address' | 'gst_number' | 'created_at' | 'updated_at'
>;

export class UserSetting
  extends Model<UserSettingAttributes, UserSettingCreationAttributes>
  implements UserSettingAttributes
{
  public id!: string;
  public user_id!: string;
  public default_hourly_rate!: number;
  public default_daily_rate!: number;
  public push_notifications!: boolean;
  public company_name!: string | null;
  public company_address!: string | null;
  public gst_number!: string | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public static initialize(sequelize: Sequelize): typeof UserSetting {
    UserSetting.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        user_id: {
          type: DataTypes.UUID,
          allowNull: false,
          unique: true,
        },
        default_hourly_rate: {
          type: DataTypes.DECIMAL(10, 2),
          defaultValue: 1200.0,
          allowNull: false,
          get() {
            const raw = this.getDataValue('default_hourly_rate');
            return raw ? parseFloat(raw as any) : 1200;
          },
        },
        default_daily_rate: {
          type: DataTypes.DECIMAL(10, 2),
          defaultValue: 9500.0,
          allowNull: false,
          get() {
            const raw = this.getDataValue('default_daily_rate');
            return raw ? parseFloat(raw as any) : 9500;
          },
        },
        push_notifications: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
          allowNull: false,
        },
        company_name: {
          type: DataTypes.STRING(150),
          allowNull: true,
        },
        company_address: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        gst_number: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'user_settings',
        modelName: 'UserSetting',
        underscored: true,
      }
    );

    return UserSetting;
  }
}

export default UserSetting;
