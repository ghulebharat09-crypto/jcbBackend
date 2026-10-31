import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface OperatorAssignmentAttributes {
  id: string;
  booking_id: string;
  operator_id: string;
  shift_start: Date | string;
  shift_end: Date | string;
  notes?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export type OperatorAssignmentCreationAttributes = Optional<
  OperatorAssignmentAttributes,
  'id' | 'notes' | 'created_at' | 'updated_at'
>;

export class OperatorAssignment
  extends Model<OperatorAssignmentAttributes, OperatorAssignmentCreationAttributes>
  implements OperatorAssignmentAttributes
{
  public id!: string;
  public booking_id!: string;
  public operator_id!: string;
  public shift_start!: Date | string;
  public shift_end!: Date | string;
  public notes!: string | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public static initialize(sequelize: Sequelize): typeof OperatorAssignment {
    OperatorAssignment.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        booking_id: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        operator_id: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        shift_start: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        shift_end: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        notes: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'operator_assignments',
        modelName: 'OperatorAssignment',
        underscored: true,
      }
    );

    return OperatorAssignment;
  }
}

export default OperatorAssignment;
