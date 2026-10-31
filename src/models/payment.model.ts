import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import {
  PaymentAttributes,
  PaymentType,
  PaymentMethod,
  PaymentStatus,
} from '../interface/payment.interface';
import convertEmptyStringToNull from '../db/hooks/convert-empty-string-to-null';

export type PaymentCreationAttributes = Optional<
  PaymentAttributes,
  'id' | 'base_charge' | 'overtime_charge' | 'fuel_transport_charge' | 'advance_adjustment' | 'status' | 'paid_at' | 'notes' | 'created_at' | 'updated_at'
>;

export class Payment
  extends Model<PaymentAttributes, PaymentCreationAttributes>
  implements PaymentAttributes
{
  public id!: string;
  public booking_id!: string;
  public payment_type!: PaymentType;
  public payment_method!: PaymentMethod;
  public base_charge!: number;
  public overtime_charge!: number;
  public fuel_transport_charge!: number;
  public advance_adjustment!: number;
  public total_amount!: number;
  public status!: PaymentStatus;
  public paid_at!: Date | string;
  public notes!: string | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public static initialize(sequelize: Sequelize): typeof Payment {
    Payment.init(
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
        payment_type: {
          type: DataTypes.ENUM('advance', 'final', 'partial'),
          defaultValue: 'advance',
          allowNull: false,
        },
        payment_method: {
          type: DataTypes.ENUM('upi', 'cash', 'bank_transfer'),
          allowNull: false,
        },
        base_charge: {
          type: DataTypes.DECIMAL(12, 2),
          defaultValue: 0,
          allowNull: false,
          get() {
            const raw = this.getDataValue('base_charge');
            return raw ? parseFloat(raw as any) : 0;
          },
        },
        overtime_charge: {
          type: DataTypes.DECIMAL(12, 2),
          defaultValue: 0,
          allowNull: false,
          get() {
            const raw = this.getDataValue('overtime_charge');
            return raw ? parseFloat(raw as any) : 0;
          },
        },
        fuel_transport_charge: {
          type: DataTypes.DECIMAL(12, 2),
          defaultValue: 0,
          allowNull: false,
          get() {
            const raw = this.getDataValue('fuel_transport_charge');
            return raw ? parseFloat(raw as any) : 0;
          },
        },
        advance_adjustment: {
          type: DataTypes.DECIMAL(12, 2),
          defaultValue: 0,
          allowNull: false,
          get() {
            const raw = this.getDataValue('advance_adjustment');
            return raw ? parseFloat(raw as any) : 0;
          },
        },
        total_amount: {
          type: DataTypes.DECIMAL(12, 2),
          allowNull: false,
          get() {
            const raw = this.getDataValue('total_amount');
            return raw ? parseFloat(raw as any) : 0;
          },
        },
        status: {
          type: DataTypes.ENUM('pending', 'paid', 'failed'),
          defaultValue: 'paid',
          allowNull: false,
        },
        paid_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
          allowNull: false,
        },
        notes: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'payments',
        modelName: 'Payment',
        underscored: true,
        hooks: {
          beforeValidate: (payment) => {
            convertEmptyStringToNull(payment);
          },
        },
      }
    );

    return Payment;
  }
}

export default Payment;
