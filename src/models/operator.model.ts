import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import { OperatorAttributes, OperatorStatus } from '../interface/operator.interface';
import convertEmptyStringToNull from '../db/hooks/convert-empty-string-to-null';

export type OperatorCreationAttributes = Optional<
  OperatorAttributes,
  'id' | 'status' | 'assigned_machine_id' | 'document_url' | 'is_active' | 'is_deleted' | 'created_at' | 'updated_at'
>;

export class Operator
  extends Model<OperatorAttributes, OperatorCreationAttributes>
  implements OperatorAttributes
{
  public id!: string;
  public name!: string;
  public phone!: string;
  public email!: string | null;
  public license_number!: string | null;
  public status!: OperatorStatus;
  public assigned_machine_id!: string | null;
  public document_url!: string | null;
  public is_active!: boolean;
  public is_deleted!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public static initialize(sequelize: Sequelize): typeof Operator {
    Operator.init(
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
        phone: {
          type: DataTypes.STRING(20),
          allowNull: false,
          unique: true,
        },
        email: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        license_number: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        status: {
          type: DataTypes.ENUM('available', 'on_duty', 'off_duty'),
          defaultValue: 'available',
          allowNull: false,
        },
        assigned_machine_id: {
          type: DataTypes.UUID,
          allowNull: true,
        },
        document_url: {
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
        tableName: 'operators',
        modelName: 'Operator',
        underscored: true,
        hooks: {
          beforeValidate: (operator) => {
            convertEmptyStringToNull(operator);
          },
        },
      }
    );

    return Operator;
  }
}

export default Operator;
